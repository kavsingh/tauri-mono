import router from "@tanstack/eslint-plugin-router";
import tailwindcss from "eslint-plugin-better-tailwindcss";
import { getDefaultSelectors } from "eslint-plugin-better-tailwindcss/defaults";
import {
	MatcherType,
	SelectorKind,
} from "eslint-plugin-better-tailwindcss/types";
import jestDom from "eslint-plugin-jest-dom";
import solid from "eslint-plugin-solid";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig } from "eslint/config";
import { configs as tsEslint } from "typescript-eslint";

// TODO: eslint via oxlint jsPlugins

export default defineConfig(
	{
		ignores: ["dist/*", "dist-isolation/*", "reports/*", ".tanstack/*"],
	},

	{
		files: ["src/**/*.?(m|c)[tj]s?(x)"],
		ignores: ["src/**/__generated__/*", "src/**/*.gen.ts"],
		extends: [
			tsEslint.base,
			// @ts-expect-error upstream types
			solid.configs["flat/typescript"],
			router.configs["flat/recommended"],
			tailwindcss.configs.recommended,
		],
		languageOptions: { parserOptions: { projectService: true } },
		settings: {
			"better-tailwindcss": {
				entryPoint: "src/index.css",
				selectors: [
					...getDefaultSelectors(),
					...["tj", "tm"].map((name) => ({
						name,
						kind: SelectorKind.Callee,
						match: [{ type: MatcherType.String }],
					})),
					...["^classNames$", "^.+ClassNames$"].map((name) => ({
						name,
						kind: SelectorKind.Attribute,
						match: [
							{ type: MatcherType.String },
							{ type: MatcherType.ObjectValue },
						],
					})),
					{
						name: "^.+ClassName$",
						kind: SelectorKind.Variable,
						match: [{ type: MatcherType.String }],
					},
					{
						name: "^.+ClassNames$",
						kind: SelectorKind.Variable,
						match: [
							{ type: MatcherType.String },
							{ type: MatcherType.ObjectValue },
						],
					},
				],
			},
		},
		rules: {
			// https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router#typescript-eslint
			"@typescript-eslint/only-throw-error": [
				"error",
				{
					allow: [
						{
							from: "package",
							package: "@tanstack/router-core",
							name: "Redirect",
						},
					],
				},
			],
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
