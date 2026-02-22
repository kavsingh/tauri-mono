import { defineConfig } from "oxlint";

export default defineConfig({
	ignorePatterns: [".nx/*", ".temp/*", "target/*", "apps/*", "packages/*"],
	categories: { correctness: "error", suspicious: "error", perf: "error" },
	plugins: ["oxc", "eslint", "import", "promise", "unicorn"],
	rules: {
		"eslint/curly": ["error", "multi-line", "consistent"],
		"eslint/eqeqeq": "error",
		"eslint/no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
		"eslint/no-shadow": ["error", { ignoreTypeValueShadow: false }],
		"eslint/no-unreachable": "error",
		"eslint/no-unused-vars": [
			"error",
			{
				args: "all",
				argsIgnorePattern: "^_",
				caughtErrors: "all",
				caughtErrorsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
				varsIgnorePattern: "^_",
				ignoreRestSiblings: true,
			},
		],

		"import/consistent-type-specifier-style": ["error", "prefer-top-level"],
		"import/extensions": [
			"error",
			"always",
			{ checkTypeImports: true, ignorePackages: true },
		],
		"import/no-cycle": "error",
		"import/no-default-export": "error",

		"unicorn/catch-error-name": ["error", { name: "cause" }],
		"unicorn/filename-case": ["error", { cases: { kebabCase: true } }],
		"unicorn/prefer-node-protocol": "error",
		"unicorn/prefer-type-error": "error",
	},
	overrides: [
		{
			files: ["./*.config.{ts,js}"],
			plugins: ["import"],
			rules: {
				"import/no-default-export": "off",
			},
		},

		{
			files: ["*.{ts,tsx}"],
			plugins: ["typescript"],
			rules: {
				"typescript/consistent-type-definitions": ["error", "interface"],
				"typescript/no-non-null-assertion": "error",
				"typescript/only-throw-error": "error",
				"typescript/prefer-ts-expect-error": "error",
				"typescript/restrict-template-expressions": [
					"error",
					{ allowNumber: true },
				],
				"typescript/switch-exhaustiveness-check": [
					"error",
					{
						allowDefaultCaseForExhaustiveSwitch: true,
						considerDefaultExhaustiveForUnions: true,
						requireDefaultForNonUnion: true,
					},
				],
			},
		},
	],
});
