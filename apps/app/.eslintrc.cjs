/** @type {import("path")} */
const path = require("node:path");

/** @type {import("eslint-plugin-vitest")} */
const vitest = require("eslint-plugin-vitest");

const { importOrderConfig } = require("../../.eslint.helpers.cjs");

const testFileSuffixes = ["test", "spec", "mock"];

/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
	root: true,
	parserOptions: { project: path.resolve(__dirname, "./tsconfig.json") },
	settings: {
		"import-x/resolver": {
			"eslint-import-resolver-typescript": {
				project: path.resolve(__dirname, "./tsconfig.json"),
			},
		},
	},
	extends: [require.resolve("../../.eslintrc.cjs")],
	rules: {
		"import-x/order": importOrderConfig(
			path.resolve(__dirname, "./tsconfig.json"),
		),
	},
	overrides: [
		{
			files: ["./*"],
			rules: {
				"filenames/match-exported": "off",
			},
		},
		{
			files: ["src-isolation/**/*", "src/**/*"],
			env: { node: false, browser: true },
			rules: {
				"no-console": "error",
			},
		},
		{
			files: ["src-isolation/**/*", "src/**/*"],
			env: { node: false, browser: true },
			settings: {
				tailwindcss: {
					callees: ["tv", "classList"],
					config: path.join(__dirname, "tailwind.config.ts"),
				},
			},
			extends: ["plugin:tailwindcss/recommended", "plugin:solid/typescript"],
		},
		{
			files: testFilePatterns(),
			env: { node: true },
			plugins: ["vitest"],
			rules: {
				// @ts-expect-error type import mismatch
				...vitest.configs.all.rules,
				"no-console": "off",
				"filenames/match-exported": [
					"error",
					"kebab",
					`\\.(${testFileSuffixes.join("|")})$`,
				],
				"vitest/no-hooks": "off",
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
			files: testFilePatterns({ root: "./src", extensions: "[jt]sx" }),
			extends: ["plugin:testing-library/dom", "plugin:jest-dom/recommended"],
		},
	],
};

function testFilePatterns({ root = "", extensions = "*" } = {}) {
	return [
		`*.{${testFileSuffixes.join(",")}}`,
		"__{test,tests,mocks,fixtures}__/**/*",
		"__{test,mock,fixture}-*__/**/*",
	].map((pattern) => path.join(root, `**/${pattern}.${extensions}`));
}
