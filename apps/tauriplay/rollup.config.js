import { fileURLToPath } from "url";

import html from "@rollup/plugin-html";
import typescript from "@rollup/plugin-typescript";

/** @type {import("rollup").RollupOptions} */
export default {
	input: fromRoot("./src-isolation/index.ts"),
	output: {
		dir: fromRoot("./dist-isolation"),
		entryFileNames: "[name]-[hash].js",
	},
	plugins: [
		typescript({ tsconfig: false }),
		html({ title: "Tauri isolation host" }),
	],
};

function fromRoot(/** @type {string} */ relPath) {
	return fileURLToPath(new URL(relPath, import.meta.url));
}
