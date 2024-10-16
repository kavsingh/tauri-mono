/// <reference types="vitest" />

import legacyPlugin from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";
import checkerPlugin from "vite-plugin-checker";
import solidPlugin from "vite-plugin-solid";
import tsconfigPathsPlugin from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
	server: { port: 3000 },
	build: { sourcemap: true },
	plugins: [
		tsconfigPathsPlugin(),
		solidPlugin(),
		legacyPlugin(),
		checker(mode),
	],
	test: {
		include: ["src/**/*.{test,spec}.?(m|c)[jt]s?(x)"],
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		clearMocks: true,
		testTransformMode: { web: ["/.[jt]sx?$/"] },
		server: { deps: { inline: [/@solidjs/] } },
		coverage: {
			include: [
				"src",
				"!**/__generated__",
				"!**/__mocks__",
				"!**/__test*__",
				"!**/*.{test,spec}.*",
			],
		},
	},
}));

function checker(mode: string) {
	if (mode !== "development") return undefined;

	return checkerPlugin({
		overlay: { initialIsOpen: false },
		typescript: true,
	});
}
