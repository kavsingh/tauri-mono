/// <reference types="vitest" />

import legacyPlugin from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";
import checkerPlugin from "vite-plugin-checker";
import solidPlugin from "vite-plugin-solid";
import tsconfigPathsPlugin from "vite-tsconfig-paths";

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
	plugins: [tsconfigPathsPlugin(), checker, solidPlugin(), legacyPlugin()],
	test: {
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		deps: { fallbackCJS: true, inline: [/solid-js/] },
	},
});
