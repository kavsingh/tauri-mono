import { defineConfig } from "oxlint";

// oxlint-disable-next-line import/no-relative-parent-imports
import baseConfig from "../../oxlint.config.ts";

export default defineConfig({
	extends: [baseConfig],
	env: { node: false, browser: true },
	ignorePatterns: [
		"dist/**",
		"reports/**",
		"**/__generated__/**",
		"!**/__generated__/__mocks__/**",
	],
	rules: {
		"eslint/no-console": "error",
		"import/no-nodejs-modules": "error",
		"import/no-relative-parent-imports": "off",
	},
});
