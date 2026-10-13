import { baseConfig, neverthrow } from "code-config/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
	extends: [baseConfig, neverthrow],
	env: { node: false, browser: true },
	ignorePatterns: [
		"dist/**",
		"reports/**",
		"**/*.gen.*",
		"**/__generated__/**",
		"!**/__generated__/__mocks__/**",
	],
	rules: {
		"eslint/no-console": "error",
		"import/no-nodejs-modules": "error",
		"import/no-relative-parent-imports": "off",
	},
});
