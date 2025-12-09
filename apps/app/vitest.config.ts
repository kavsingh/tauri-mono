import { defineConfig, mergeConfig } from "vitest/config";

import baseConfig from "./vite.config.ts";

export default mergeConfig(
	baseConfig({ command: "build", mode: "production" }),
	defineConfig({
		resolve: { conditions: ["development", "browser"] },
		test: {
			include: ["src/**/*.{test,spec}.?(m|c)[tj]s?(x)"],
			environment: "jsdom",
			setupFiles: ["./src/vitest.setup.ts"],
			clearMocks: true,
			expect: { requireAssertions: true },
			coverage: {
				include: [
					"src",
					"!**/__generated__",
					"!**/__mocks__",
					"!**/__test*__",
					"!**/*.{test,spec}.*",
				],
			},
			server: {
				deps: {
					inline: ["@solidjs/testing-library", "@solidjs/router"],
				},
			},
		},
	}),
);
