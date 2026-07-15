import { baseConfig } from "code-config/oxlint";
import { defineConfig } from "oxlint";

import type { OxlintConfig } from "oxlint";

const config: OxlintConfig = defineConfig({
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
			rules: {
				"eslint/no-console": "error",
				"import/no-nodejs-modules": "error",
			},
		},
	],
});

export default config;
