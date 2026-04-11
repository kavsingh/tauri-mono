import path from "node:path";

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
import { defineConfig } from "oxlint";

import baseConfig from "../../oxlint.config.ts";

import type { DummyRuleMap } from "oxlint";

export default defineConfig({
	extends: [baseConfig],
	env: { node: true, browser: false },
	ignorePatterns: [
		"dist/**",
		"dist-isolation/**",
		"reports/**",
		".tanstack/**",
		"**/*.gen.*",
		"**/__generated__/**",
		"!**/__generated__/__mocks__/**",
	],
	settings: {
		vitest: { typecheck: true },

		"jsx-a11y": {
			attributes: { for: ["for"] },
			components: { Link: "a" },
		},

		"better-tailwindcss": {
			entryPoint: path.resolve(import.meta.dirname, "./src/index.css"),
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
	overrides: [
		{
			files: ["./src/**/*.{ts,tsx}"],
			plugins: ["import", "jsx-a11y"],
			jsPlugins: [
				"eslint-plugin-solid",
				"@tanstack/eslint-plugin-router",
				"eslint-plugin-better-tailwindcss",
			],
			rules: {
				"eslint/no-console": "error",
				"eslint/no-restricted-imports": [
					"error",
					{
						paths: [
							{
								name: "tailwind-merge",
								message: "please import helpers from #src/style",
							},
							{
								name: "tailwind-variants",
								message: "please import helpers from #src/style",
							},
						],
					},
				],

				// https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router#typescript-eslint
				"typescript/only-throw-error": [
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

				"import/no-nodejs-modules": "error",
				"import/no-unassigned-import": ["error", { allow: ["**/*.css"] }],

				...solid.configs["flat/typescript"].rules,
				// @TODO: rule uses unimplemented markVariableAsUsed. remove this
				// override when possible
				"solid/jsx-uses-vars": "off",

				...router.configs["flat/recommended"].reduce<DummyRuleMap>(
					(acc, item) => Object.assign(acc, item.rules),
					{},
				),

				...tailwindcss.configs["recommended-error"].rules,
				"better-tailwindcss/enforce-consistent-line-wrapping": "off",
				"better-tailwindcss/enforce-consistent-variant-order": "error",
				"better-tailwindcss/enforce-logical-properties": "error",
			},
		},

		{
			files: ["./src/**/*.test.{ts,tsx}"],
			plugins: ["vitest"],
			jsPlugins: ["eslint-plugin-jest-dom", "eslint-plugin-testing-library"],
			rules: {
				"eslint/no-console": "off",

				"vitest/no-disabled-tests": "error",
				"vitest/no-focused-tests": "error",
				"vitest/no-import-node-test": "error",

				...jestDom.configs["flat/recommended"].rules,
				...testingLibrary.configs["flat/dom"].rules,
			},
		},
	],
});
