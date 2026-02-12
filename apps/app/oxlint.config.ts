import { defineConfig } from "oxlint";

// oxlint-disable-next-line import/no-relative-parent-imports
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
			files: ["src/**"],
			env: { browser: true, node: false },
			plugins: ["eslint", "import"],
			rules: {
				"eslint/no-console": "error",
				"import/extensions": "off",
				"import/no-nodejs-modules": "error",
			},
		},
	],
});
