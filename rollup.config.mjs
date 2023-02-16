import { fileURLToPath } from "url";

import html from "@rollup/plugin-html";
import typescript from "@rollup/plugin-typescript";

const fromRoot = (/** @type {string} */ relPath) =>
	fileURLToPath(new URL(relPath, import.meta.url));

/** @type {import("rollup").RollupOptions} */
export default {
	input: fromRoot("./src-isolation/index.ts"),
	output: {
		dir: fromRoot("./dist-isolation"),
		entryFileNames: "[name]-[hash].js",
	},
	plugins: [typescript(), html({ title: "Tauri isolation host" })],
};
