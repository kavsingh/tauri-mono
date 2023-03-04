const path = require("path");

const requireJSON5 = require("require-json5");

const tsconfig = requireJSON5("./tsconfig.json");

const srcDependencies = {
	devDependencies: false,
	optionalDependencies: false,
	peerDependencies: false,
};

const devDependencies = {
	devDependencies: true,
	optionalDependencies: false,
	peerDependencies: false,
};

const tsconfigPathPatterns = Object.keys(tsconfig.compilerOptions.paths);
const testFileSuffixes = ["test", "spec", "mock"];

function testFilePatterns({ root = "", extensions = "*" } = {}) {
	return [
		`*.{${testFileSuffixes.join(",")}}`,
		"__{test,tests,mocks,fixtures}__/**/*",
		"__{test,mock,fixture}-*__/**/*",
	].map((pattern) => path.join(root, `**/${pattern}.${extensions}`));
}

/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
	root: true,
	reportUnusedDisableDirectives: true,
	env: { es2022: true, node: true, browser: false },
	settings: {
		"import/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
		"import/resolver": {
			"eslint-import-resolver-typescript": { project: "./tsconfig.json" },
		},
	},
	plugins: ["filenames"],
	extends: [
		"eslint:recommended",
		"plugin:import/recommended",
		"plugin:import/typescript",
		"plugin:prettier/recommended",
	],
	rules: {
		"curly": ["warn", "multi-line", "consistent"],
		"no-console": "off",
		"no-throw-literal": "error",
		"no-unreachable": "error",
		"filenames/match-regex": ["error", "^[a-z0-9-.]+$", true],
		"filenames/match-exported": ["error", "kebab"],
		"import/no-cycle": "error",
		"import/no-self-import": "error",
		"import/no-unused-modules": "error",
		"import/no-useless-path-segments": "error",
		"import/no-extraneous-dependencies": ["error", devDependencies],
		"import/order": [
			"warn",
			{
				"groups": [
					"builtin",
					"external",
					"internal",
					["parent", "sibling", "index"],
					"type",
				],
				"pathGroups": [
					...tsconfigPathPatterns.map((pattern) => ({
						pattern,
						group: "internal",
					})),
				],
				"pathGroupsExcludedImportTypes": ["type"],
				"alphabetize": { order: "asc" },
				"newlines-between": "always",
			},
		],
		"prettier/prettier": "warn",
	},
	overrides: [
		{
			files: ["*.mjs"],
			parserOptions: { sourceType: "module", ecmaVersion: "latest" },
		},
		{
			files: ["*.ts?(x)"],
			parser: "@typescript-eslint/parser",
			parserOptions: { project: "./tsconfig.json" },
			extends: [
				"plugin:@typescript-eslint/recommended",
				"plugin:@typescript-eslint/recommended-requiring-type-checking",
				"plugin:@typescript-eslint/strict",
				"plugin:solid/typescript",
			],
			plugins: ["deprecation"],
			rules: {
				"camelcase": "off",
				"no-restricted-syntax": [
					"warn",
					{ selector: "TSEnumDeclaration", message: "Avoid using enums" },
				],
				"no-shadow": "off",
				"no-throw-literal": "off",
				"no-unused-vars": "off",
				"@typescript-eslint/consistent-type-definitions": ["warn", "type"],
				"@typescript-eslint/consistent-type-imports": [
					"error",
					{ disallowTypeAnnotations: false },
				],
				"@typescript-eslint/member-ordering": ["warn"],
				"@typescript-eslint/no-shadow": [
					"error",
					{
						ignoreTypeValueShadow: false,
						ignoreFunctionTypeParameterNameValueShadow: true,
					},
				],
				"@typescript-eslint/no-throw-literal": "error",
				"@typescript-eslint/no-unused-vars": [
					"error",
					{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
				],
				"deprecation/deprecation": "warn",
			},
		},
		{
			files: ["./*"],
			rules: {
				"filenames/match-exported": "off",
			},
		},
		{
			files: ["src/**/*"],
			env: { node: false, browser: true },
			settings: { tailwindcss: { callees: ["twMerge", "twJoin"] } },
			extends: ["plugin:tailwindcss/recommended"],
			rules: {
				"no-console": "error",
				"import/no-extraneous-dependencies": ["error", srcDependencies],
			},
		},
		{
			files: testFilePatterns(),
			env: { node: true },
			extends: ["plugin:testing-library/dom", "plugin:jest-dom/recommended"],
			rules: {
				"no-console": "off",
				"import/no-extraneous-dependencies": ["error", devDependencies],
				"filenames/match-exported": [
					"error",
					"kebab",
					`\\.(${testFileSuffixes.join("|")})$`,
				],
			},
		},
		{
			files: testFilePatterns({ extensions: "ts?(x)" }),
			rules: {
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
	],
};
