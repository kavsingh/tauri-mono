/// <reference types="@wdio/tauri-service" />

import { spawnSync } from "node:child_process";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../../");
const binaryPath = path.resolve(
	projectRoot,
	"target/universal-apple-darwin/release/app",
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
		spawnSync("pnpm nx build:e2e:mac app", {
			cwd: projectRoot,
			stdio: "inherit",
			shell: true,
		});
	},
};
