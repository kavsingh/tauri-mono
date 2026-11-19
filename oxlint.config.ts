import { baseConfig } from "code-config/oxlint";
import { defineConfig } from "oxlint";

import type { OxlintConfig } from "oxlint";

const config: OxlintConfig = defineConfig({
	extends: [baseConfig],
	ignorePatterns: [".nx/*", ".temp/*", "target/*", "apps/*", "packages/*"],
});

export default config;
