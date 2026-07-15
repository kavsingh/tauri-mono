import { baseConfig } from "code-config/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
	extends: [baseConfig],
	ignorePatterns: [".nx/*", ".temp/*", "target/*", "apps/*", "packages/*"],
});
