/// <reference types="vitest" />

import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

const dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	root: path.resolve(dirname, "src-isolation"),
	build: { outDir: path.resolve(dirname, "dist-isolation") },
});
