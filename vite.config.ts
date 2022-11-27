/// <reference types="vitest" />

import { fileURLToPath } from "url";

import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import legacyPlugin from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";
import checkerPlugin from "vite-plugin-checker";
import solidPlugin from "vite-plugin-solid";

const fromRoot = (relPath: string) =>
	fileURLToPath(new URL(relPath, import.meta.url));

const checker = checkerPlugin({
	overlay: { initialIsOpen: false },
	typescript: true,
	eslint: {
		lintCommand: 'eslint "./src/**/*.+(ts|tsx)"',
		dev: { logLevel: ["error"] },
	},
});

export default defineConfig({
	server: { port: 3000 },
	build: { sourcemap: true },
	plugins: [vanillaExtractPlugin(), checker, solidPlugin(), legacyPlugin()],
	resolve: { alias: { "~": fromRoot("./src") } },
	test: {
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		environment: "jsdom",
		deps: { fallbackCJS: true, inline: [/solid-js/] },
	},
});
