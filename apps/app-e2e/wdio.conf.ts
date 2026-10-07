/// <reference types="@wdio/tauri-service" />

import { spawnSync } from "node:child_process";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../../");
const binaryPath = path.resolve(
	projectRoot,
	process.platform === "win32"
		? "target/x86_64-pc-windows-msvc/debug/app.exe"
		: "target/universal-apple-darwin/debug/app",
);

export const config: WebdriverIO.Config = {
	runner: "local",
	specs: ["./test/**/*.e2e.ts"],
	exclude: [],
	maxInstances: 1,
	logLevel: "info",
	bail: 0,
	waitforTimeout: 10_000,
	connectionRetryTimeout: 0,
	connectionRetryCount: 0,
	framework: "mocha",
	reporters: ["spec"],
	mochaOpts: { ui: "bdd", timeout: 60_000 },

	// tauri

	services: [
		[
			"@wdio/tauri-service",
			{ driverProvider: "embedded", appBinaryPath: binaryPath },
		],
	],

	capabilities: [
		{
			browserName: "tauri",
			// @ts-expect-error - as per docs
			"tauri:options": { application: binaryPath },
		},
	],

	onPrepare: () => {
		const os = process.platform === "win32" ? "win" : "mac";

		spawnSync(`pnpm nx build:e2e:${os} app`, {
			cwd: projectRoot,
			stdio: "inherit",
			shell: true,
		});
	},
};
