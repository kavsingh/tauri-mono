import tailwindcss from "eslint-plugin-better-tailwindcss";
import { getDefaultCallees } from "eslint-plugin-better-tailwindcss/api/defaults";
import jestDom from "eslint-plugin-jest-dom";
import solid from "eslint-plugin-solid";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig } from "eslint/config";
import { configs as tsEslint } from "typescript-eslint";

export default defineConfig(
	{
		linterOptions: { reportUnusedDisableDirectives: true },
		languageOptions: { parserOptions: { projectService: true } },
		ignores: [
			"src-tauri/*",
			"dist/*",
			"dist-isolation/*",
			"reports/*",
			"**/__generated__/*",
			"!**/__generated__/__mocks__/",
		],
	},

	{
		files: ["src/**/*.?(m|c)[tj]s?(x)"],
		extends: [
			tsEslint.base,
			// @ts-expect-error upstream types
			solid.configs["flat/recommended"],
		],
		settings: {
			"better-tailwindcss": {
				entryPoint: "src/index.css",
				callees: [...getDefaultCallees(), "tj", "tm"],
			},
		},
		plugins: { "better-tailwindcss": tailwindcss },
		rules: {
			...tailwindcss.configs["recommended"]?.rules,
			"better-tailwindcss/enforce-consistent-line-wrapping": "off",
			"better-tailwindcss/enforce-shorthand-classes": "warn",
			"better-tailwindcss/no-conflicting-classes": "error",
		},
	},

	{
		files: ["src/**/*.test.?(m|c)[tj]s?(x)"],
		extends: [
			testingLibrary.configs["flat/dom"],
			jestDom.configs["flat/recommended"],
		],
	},
);
