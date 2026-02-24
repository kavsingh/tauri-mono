import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import legacy from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";
import { checker } from "vite-plugin-checker";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

function createChecker(mode: string) {
	if (mode !== "development") return undefined;

	return checker({
		overlay: { initialIsOpen: false },
		typescript: true,
	});
}

export default defineConfig(({ mode }) => {
	return {
		server: { port: 5321, host: "0.0.0.0" },
		oxc: { jsx: { importSource: "solid-js" } },
		plugins: [
			devtools(),
			tsconfigPaths(),
			tanstackRouter(),
			solid(),
			tailwindcss(),
			legacy(),
			createChecker(mode),
		],
	};
});
