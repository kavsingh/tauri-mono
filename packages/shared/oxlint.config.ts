import { baseConfig } from "code-config/oxlint";
import { defineConfig } from "oxlint";

import type { OxlintConfig } from "oxlint";

const config: OxlintConfig = defineConfig({
	extends: [baseConfig],
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

export default config;
