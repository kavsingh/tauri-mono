import path from "node:path";

import { fixupPluginRules } from "@eslint/compat";
// @ts-expect-error no types available
import jestDom from "eslint-plugin-jest-dom";
import solid from "eslint-plugin-solid";
import tailwind from "eslint-plugin-tailwindcss";
// @ts-expect-error no types available
import testingLibrary from "eslint-plugin-testing-library";
import vitest from "eslint-plugin-vitest";
import globals from "globals";
import * as tsEslint from "typescript-eslint";

import baseConfig from "../../eslint.config";
import { testFilePatterns, testFileSuffixes } from "../../eslint.helpers";

import { getFileLocation } from "./scripts/lib";

const { dirname } = getFileLocation(import.meta.url);

export default tsEslint.config(
	...baseConfig,

	{
		ignores: [
			"src-tauri/*",
			"dist/*",
			"dist-isolation/*",
			"coverage/*",
			"**/__generated__/*",
			"!**/__generated__/__mocks__/",
		],
	},

	{
		settings: {
			"import-x/resolver": {
				"eslint-import-resolver-typescript": {
					project: path.resolve(dirname, "tsconfig.json"),
				},
			},
		},
	},

	{
		files: ["src/**/*.?(m|c)[tj]s?(x)"],
		languageOptions: {
			globals: { ...globals.browser },
		},
		settings: {
			tailwindcss: {
				config: path.join(dirname, "tailwind.config.ts"),
				callees: ["tv", "classList"],
			},
		},
		extends: [
			...tailwind.configs["flat/recommended"],
			solid.configs["flat/recommended"],
		],
		rules: {
			"no-console": "error",
		},
	},

	{
		files: testFilePatterns(),
		languageOptions: {
			globals: { ...globals.node },
		},
		rules: {
			"no-console": "off",
			"filenames/match-exported": [
				"error",
				{
					transforms: ["kebab"],
					remove: `\\.(${testFileSuffixes.join("|")})$`,
				},
			],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/unbound-method": "off",
		},
	},

	{
		files: testFilePatterns({ root: "src" }),
		languageOptions: {
			globals: { ...globals.node, ...globals.browser },
		},
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		extends: [
			vitest.configs.all,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			jestDom.configs["flat/recommended"],
		],
		plugins: {
			"testing-library": fixupPluginRules({
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
				rules: testingLibrary.rules,
			}),
		},
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		rules: {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			...testingLibrary.configs["flat/dom"].rules,
			"vitest/no-hooks": "off",
		},
	},
);
