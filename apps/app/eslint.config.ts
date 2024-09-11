import path from "node:path";

// @ts-expect-error no types available
import jestDomPlugin from "eslint-plugin-jest-dom";
import solidPlugin from "eslint-plugin-solid";
// @ts-expect-error no types available
import tailwindPlugin from "eslint-plugin-tailwindcss";
// @ts-expect-error no types available
import testingPlugin from "eslint-plugin-testing-library";
import vitestPlugin from "eslint-plugin-vitest";
import globals from "globals";
import * as tsEslintPlugin from "typescript-eslint";

import baseConfig from "../../eslint.config";
import { testFilePatterns, testFileSuffixes } from "../../eslint.helpers";

import { getFileLocation } from "./scripts/lib";

const { dirname } = getFileLocation(import.meta.url);

export default tsEslintPlugin.config(
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
		files: ["src/**/*.?([mc])[tj]s?(x)"],
		languageOptions: {
			globals: { ...globals.browser },
		},
		settings: {
			tailwindcss: {
				config: path.join(dirname, "tailwind.config.ts"),
				callees: ["tv", "classList"],
			},
		},
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		extends: [
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			...tailwindPlugin.configs["flat/recommended"],
			solidPlugin.configs["flat/recommended"],
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
			vitestPlugin.configs.all,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			testingPlugin.configs.recommended,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			jestDomPlugin.configs["flat/recommended"],
		],
		rules: {
			"vitest/no-hooks": "off",
		},
	},
);
