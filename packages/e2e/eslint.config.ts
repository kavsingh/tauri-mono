import path from "node:path";
import { fileURLToPath } from "node:url";

import wdioPlugin from "eslint-plugin-wdio";
import * as tsEslintPlugin from "typescript-eslint";

import baseConfig from "../../eslint.config";
import { testFilePatterns, testFileSuffixes } from "../../eslint.helpers";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default tsEslintPlugin.config(
	{
		ignores: ["/coverage/*"],
	},

	...baseConfig,

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
		files: testFilePatterns(),
		plugins: { wdio: wdioPlugin },
		// @ts-expect-error wdio types
		rules: {
			"no-console": "off",
			"filenames/match-exported": [
				"error",
				"kebab",
				`\\.(${testFileSuffixes.join("|")})$`,
			],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"@typescript-eslint/unbound-method": "off",
			...wdioPlugin.configs.recommended.rules,
		},
	},
);
