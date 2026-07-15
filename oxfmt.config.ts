import { defineConfig } from "oxfmt";

export default defineConfig({
	ignorePatterns: [
		"**/.nx/**",
		"**/dist/**",
		"**/gen/**",
		"**/dist-*/**",
		"**/reports/**",
		"**/target/**",
		"**/*.gen.*",
		"**/*.generated.*",
		"!**/__mocks__/*.gen.*",
		"!**/__mocks__/*.generated.*",
		"!**/__generated__/__mocks__/**",
		"**/pnpm-*.yaml",
	],
	printWidth: 80,
	useTabs: true,
	sortImports: {
		order: "asc",
		groups: [
			["builtin"],
			["external"],
			["subpath", "internal"],
			["parent"],
			["sibling", "index"],
			["type"],
		],
	},
	overrides: [
		{ files: ["*.json", "*.jsonc"], options: { trailingComma: "none" } },
	],
});
