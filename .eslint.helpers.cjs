/** @type {import("typescript")} */
const ts = require("typescript");

/**
 * @typedef {import("eslint").Linter.RuleLevel} RuleLevel
 * @param {string} tsconfigName
 * @param {(config: Record<string, unknown>) => Record<string, unknown>} customizer
 *
 * @returns {[RuleLevel, Record<string, unknown>]}
 **/
function importOrderConfig(
	tsconfigName,
	customizer = (config) => config,
) {
	const tsconfigFile = ts.findConfigFile(
		__dirname,
		ts.sys.fileExists,
		tsconfigName,
	);

	const config = tsconfigFile
		? ts.readConfigFile(tsconfigFile, ts.sys.readFile)
		: undefined;

	const aliases = Object.keys(config?.config?.compilerOptions?.paths ?? {});

	return [
		"warn",
		customizer({
			"alphabetize": { order: "asc" },
			"groups": [
				"builtin",
				"external",
				"internal",
				"parent",
				["sibling", "index"],
				"type",
			],
			"pathGroups": aliases.map((pattern) => ({ pattern, group: "internal" })),
			"pathGroupsExcludedImportTypes": ["type"],
			"newlines-between": "always",
		}),
	];
}

module.exports = { importOrderConfig };
