/// <reference lib="es2023.array" />

import { createHash, createPublicKey, sign } from "node:crypto";
import {
	cp,
	mkdir,
	readFile,
	readdir,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";

import type { Dirent } from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(root, "../..");
const dist = path.join(root, "dist");
const mode = process.argv[2];
const maxFiles = 10_000;
const maxFileSize = 50 * 1024 * 1024;
const maxTotalSize = 500 * 1024 * 1024;
const compatibilityVersion = 1;

interface FrontendFile {
	path: string;
	size: number;
	sha256: string;
}

async function collectFiles(
	directory: string,
	relativeDirectory = "",
): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry: Dirent) => {
			const relativePath = path.posix.join(relativeDirectory, entry.name);
			const fullPath = path.join(directory, entry.name);

			if (entry.isSymbolicLink()) {
				console.error(`Build output contains a symlink: ${relativePath}`);
				process.exitCode = 1;
				return [];
			}
			if (entry.isDirectory()) {
				return collectFiles(fullPath, relativePath);
			}
			if (!entry.isFile()) {
				console.error(
					`Build output contains an unsupported file: ${relativePath}`,
				);
				process.exitCode = 1;
				return [];
			}
			return [relativePath];
		}),
	);

	return nested.flat();
}

async function fingerprintInputs(
	directory: string,
	relativeDirectory = "",
): Promise<string> {
	const entries = (await readdir(directory, { withFileTypes: true })).toSorted(
		(left, right) => left.name.localeCompare(right.name),
	);
	const hash = createHash("sha256");
	const records = await Promise.all(
		entries.map(async (entry: Dirent) => {
			if (
				entry.name === "node_modules" ||
				entry.name === "dist" ||
				entry.name === "reports" ||
				entry.name === "test" ||
				entry.name === "test-helpers" ||
				entry.name.endsWith(".test.ts") ||
				entry.name.endsWith(".tsbuildinfo")
			) {
				return null;
			}
			const relativePath = path.posix.join(relativeDirectory, entry.name);
			const fullPath = path.join(directory, entry.name);

			if (entry.isDirectory()) {
				return {
					path: relativePath,
					data: await fingerprintInputs(fullPath, relativePath),
				};
			}
			if (!entry.isFile()) return null;
			return { path: relativePath, data: await readFile(fullPath) };
		}),
	);
	for (const record of records) {
		if (!record) continue;
		hash.update(record.path);
		hash.update(record.data);
	}

	return hash.digest("hex");
}

async function main() {
	if (mode !== "release" && mode !== "embedded") {
		console.error("Expected build mode `release` or `embedded`");
		process.exitCode = 1;
		return;
	}
	let releaseSigningKey: Buffer | undefined;
	if (mode === "release") {
		const keyPath = process.env["FRONTEND_RELEASE_PRIVATE_KEY_FILE"];
		const publicKeyHex = process.env["FRONTEND_RELEASE_PUBLIC_KEY"];
		if (!keyPath || !publicKeyHex) {
			console.error("Frontend release private and public keys are required");
			process.exitCode = 1;
			return;
		}
		releaseSigningKey = await readFile(keyPath);
		const publicKey = createPublicKey(releaseSigningKey)
			.export({ type: "spki", format: "der" })
			.subarray(-32)
			.toString("hex");
		if (publicKey !== publicKeyHex.toLowerCase()) {
			console.error(
				"Frontend release private key does not match FRONTEND_RELEASE_PUBLIC_KEY",
			);
			process.exitCode = 1;
			return;
		}
	}
	const signingKeyId = releaseSigningKey
		? createHash("sha256")
				.update(
					createPublicKey(releaseSigningKey)
						.export({
							type: "spki",
							format: "der",
						})
						.subarray(-32),
				)
				.digest("hex")
				.slice(0, 16)
		: "";
	const fingerprint = createHash("sha256")
		.update(await fingerprintInputs(root))
		.update(
			await fingerprintInputs(path.join(workspaceRoot, "packages/shared")),
		)
		.update(await readFile(path.join(workspaceRoot, "pnpm-lock.yaml")))
		.update(signingKeyId)
		.digest("hex")
		.slice(0, 32);
	process.env["VITE_FRONTEND_BUILD_ID"] = fingerprint;

	await build({
		configFile: path.join(root, "vite.config.ts"),
		mode: "production",
	});

	const filePaths = (await collectFiles(dist))
		.filter((filePath) => filePath !== "manifest.json")
		.toSorted();
	if (
		process.exitCode !== undefined ||
		filePaths.length === 0 ||
		filePaths.length > maxFiles
	) {
		console.error(`Invalid frontend file count: ${filePaths.length}`);
		process.exitCode = 1;
		return;
	}

	const files: FrontendFile[] = await Promise.all(
		filePaths.map(async (filePath) => {
			const fullPath = path.join(dist, ...filePath.split("/"));
			const [metadata, bytes] = await Promise.all([
				stat(fullPath),
				readFile(fullPath),
			]);
			return {
				path: filePath,
				size: metadata.size,
				sha256: createHash("sha256").update(bytes).digest("hex"),
			};
		}),
	);
	const totalSize = files.reduce((total, file) => total + file.size, 0);
	const oversizedFile = files.find((file) => file.size > maxFileSize);
	if (oversizedFile || totalSize > maxTotalSize) {
		console.error(
			oversizedFile
				? `Frontend file exceeds the size limit: ${oversizedFile.path}`
				: "Frontend build exceeds the total size limit",
		);
		process.exitCode = 1;
		return;
	}

	const payload = {
		schemaVersion: 1,
		buildId: fingerprint,
		compatibilityVersion,
		entryPoint: "index.html",
		files,
	};
	let signature = "";

	if (releaseSigningKey) {
		signature = sign(
			null,
			Buffer.from(JSON.stringify(payload)),
			releaseSigningKey,
		).toString("base64");
	}

	const manifest = { ...payload, signature };
	await writeFile(
		path.join(dist, "manifest.json"),
		`${JSON.stringify(manifest, null, "\t")}\n`,
	);

	if (mode === "release") {
		const releaseDirectory = path.join(dist, "releases", fingerprint);
		await mkdir(releaseDirectory, { recursive: true });
		await Promise.all(
			filePaths.map(async (filePath) => {
				const source = path.join(dist, ...filePath.split("/"));
				const target = path.join(releaseDirectory, ...filePath.split("/"));
				await mkdir(path.dirname(target), { recursive: true });
				await cp(source, target);
			}),
		);
		await cp(
			path.join(dist, "manifest.json"),
			path.join(releaseDirectory, "manifest.json"),
		);
	} else {
		const embeddedDirectory = path.join(workspaceRoot, "apps/app/fallback/ui");
		await rm(embeddedDirectory, { recursive: true, force: true });
		await mkdir(embeddedDirectory, { recursive: true });
		await Promise.all(
			[...filePaths, "manifest.json"].map(async (filePath) => {
				const source = path.join(dist, ...filePath.split("/"));
				const target = path.join(embeddedDirectory, ...filePath.split("/"));
				await mkdir(path.dirname(target), { recursive: true });
				await cp(source, target);
			}),
		);
	}

	console.log(`Built ${mode} frontend ${fingerprint} (${files.length} files)`);
}

main().catch((cause) => {
	console.error("Frontend release build failed", cause);
	process.exitCode = 1;
});
