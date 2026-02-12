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
		"**/*.gen.ts",
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
				"eslint/no-restricted-imports": [
					"error",
					{
						paths: [
							{
								name: "tailwind-merge",
								message: "please import helpers from #lib/style",
							},
							{
								name: "tailwind-variants",
								message: "please import helpers from #lib/style",
							},
						],
					},
				],
				"import/extensions": "off",
				"import/no-nodejs-modules": "error",
			},
		},
		{
			files: ["src/**/*.tsx"],
			plugins: ["jsx-a11y", "promise"],
			rules: {
				"eslint/max-lines-per-function": [
					"warn",
					{ max: 100, skipBlankLines: true, skipComments: true },
				],
			},
		},
		{
			files: ["src/**/*.test.{ts,tsx}"],
			env: { browser: true, node: true },
			plugins: ["vitest"],
			rules: {
				"eslint/max-lines-per-function": "off",
				"eslint/no-console": "off",
				"import/no-namespace": "off",
				"unicorn/consistent-function-scoping": "off",
				"vitest/no-disabled-tests": "error",
				"vitest/no-focused-tests": "error",
				"vitest/prefer-to-be-falsy": "off",
				"vitest/prefer-to-be-truthy": "off",
			},
		},
	],
	settings: {
		vitest: { typecheck: true },
	},
});
