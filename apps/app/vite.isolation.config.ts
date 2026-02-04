import path from "node:path";

import { defineConfig } from "rolldown-vite";

const dirname = import.meta.dirname;

export default defineConfig({
	root: path.resolve(dirname, "src-isolation"),
	build: { outDir: path.resolve(dirname, "dist-isolation"), minify: true },
});
