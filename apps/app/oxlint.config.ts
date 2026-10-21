import { baseConfig } from "code-config/oxlint";
import { defineConfig } from "oxlint";

import type { OxlintConfig } from "oxlint";

const config: OxlintConfig = defineConfig({
	extends: [baseConfig],
	env: { node: true, browser: false },
	ignorePatterns: [
		"dist-isolation/**",
		"reports/**",
		"**/*.gen.*",
		"!**/__mocks__/*.gen.*",
	],
});

export default config;
