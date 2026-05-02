import { defineConfig } from "oxlint";

import baseConfig from "../../oxlint.config.ts";

export default defineConfig({
	extends: [baseConfig],
	env: { node: true, browser: false },
	ignorePatterns: [
		"dist/**",
		"dist-isolation/**",
		"reports/**",
		"**/*.gen.*",
		"**/__generated__/**",
		"!**/__generated__/__mocks__/**",
	],
	overrides: [
		{
			files: ["./src/**/*.ts"],
			env: { node: false, browser: true },
			plugins: ["import"],
			rules: {
				"eslint/no-console": "error",
				"import/no-nodejs-modules": "error",
			},
		},
	],
});
