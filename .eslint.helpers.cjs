/** @type {import("node:path")} */
const path = require("node:path");

/** @type {import("typescript")} */
const ts = require("typescript");
/** @type {import("zod")} */
const { z } = require("zod");

/** @typedef {import("zod").infer<typeof tsConfigSchema>} TsConfig */

const tsConfigSchema = z.object({
	compilerOptions: z.object({
		paths: z.record(z.array(z.string())).optional(),
	}).optional(),
});

/**
 * @param {string} configPath
 *
 * @returns {TsConfig | undefined}
 **/
function readTsConfig(configPath) {
	const contents = ts.findConfigFile(
		path.isAbsolute(configPath) ? path.dirname(configPath) : __dirname,
		ts.sys.fileExists,
		configPath,
	);

	return contents
		? tsConfigSchema.parse(ts.readConfigFile(contents, ts.sys.readFile).config)
		: undefined;
}

/**
 * @typedef {import("eslint").Linter.RuleLevel} RuleLevel
 * 
 * @param {string} tsConfigPath
 * @param {(config: Record<string, unknown>, tsconfig: TsConfig | undefined) => Record<string, unknown>} customizer
 *
 * @returns {[RuleLevel, Record<string, unknown>]}
 **/
function importOrderConfig(tsConfigPath, customizer = (config) => config) {
	const tsConfig = readTsConfig(tsConfigPath);
	const aliases = Object.keys(tsConfig?.compilerOptions?.paths ?? {});

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
			"pathGroups": aliases.map((pattern) => {
				return { pattern, group: "internal" };
			}),
			"pathGroupsExcludedImportTypes": ["type"],
			"newlines-between": "always",
		}, tsConfig),
	];
}

module.exports = { readTsConfig, importOrderConfig };
