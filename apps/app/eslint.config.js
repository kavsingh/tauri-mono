import tailwindcss from "eslint-plugin-better-tailwindcss";
import {
	getDefaultAttributes,
	getDefaultCallees,
	getDefaultVariables,
} from "eslint-plugin-better-tailwindcss/api/defaults";
import jestDom from "eslint-plugin-jest-dom";
import solid from "eslint-plugin-solid";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig } from "eslint/config";
import { configs as tsEslint } from "typescript-eslint";

export default defineConfig(
	{ linterOptions: { reportUnusedDisableDirectives: true } },

	{
		files: ["src/**/*.?(m|c)[tj]s?(x)"],
		ignores: ["src/**/__generated__/*"],
		extends: [
			tsEslint.base,
			// @ts-expect-error upstream types
			solid.configs["flat/recommended"],
			// @ts-expect-error upstream types
			tailwindcss.configs.recommended,
		],
		settings: {
			"better-tailwindcss": {
				entryPoint: "src/index.css",
				callees: [...getDefaultCallees(), "tj", "tm"],
				variables: [
					...getDefaultVariables(),
					[".+ClassName", [{ match: "strings" }]],
					[".+ClassNames", [{ match: "strings" }, { match: "objectValues" }]],
				],
				attributes: [
					...getDefaultAttributes(),
					["classNames", [{ match: "strings" }, { match: "objectValues" }]],
					[".+ClassNames", [{ match: "strings" }, { match: "objectValues" }]],
				],
			},
		},
		rules: {
			"better-tailwindcss/enforce-consistent-line-wrapping": "off",
			"better-tailwindcss/enforce-consistent-important-position": "warn",
			"better-tailwindcss/enforce-shorthand-classes": "warn",
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
