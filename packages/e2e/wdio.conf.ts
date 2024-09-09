import { spawn, spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Options } from "@wdio/types";

const dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = path.resolve(dirname, "../../");

let tauriDriver: ReturnType<typeof spawnTauriDriver> | undefined;

function spawnTauriDriver() {
	return spawn(
		path.resolve(os.homedir(), ".cargo", "bin", "tauri-driver"),
		[],
		{ stdio: [null, process.stdout, process.stderr] },
	);
}

export const config: Options.Testrunner = {
	specs: ["./specs/**/*.ts"],
	maxInstances: 1,
	capabilities: [
		{
			// @ts-expect-error custom tauri business
			"wdio:maxInstances": 1,
			"tauri:options": {
				// @ts-expect-error custom tauri business
				application: path.resolve(repoRoot, "target/release/app"),
			},
		},
	],
	reporters: ["spec"],
	framework: "mocha",
	mochaOpts: { ui: "bdd", timeout: 60_000 },

	// ensure the rust project is built since we expect this binary to exist for the webdriver sessions
	onPrepare() {
		spawnSync("pnpm", ["build"], { cwd: repoRoot, stdio: "inherit" });
	},

	// ensure we are running `tauri-driver` before the session starts so that we can proxy the webdriver requests
	beforeSession() {
		tauriDriver = spawnTauriDriver();
	},

	// clean up the `tauri-driver` process we spawned at the start of the session
	afterSession() {
		tauriDriver?.kill();
	},
};
