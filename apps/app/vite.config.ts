import tailwindcss from "@tailwindcss/vite";
import legacy from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";
import { checker } from "vite-plugin-checker";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	return {
		server: { port: 3000 },
		build:
			mode === "production"
				? { sourcemap: true, minify: "terser" }
				: { sourcemap: false, minify: false },
		oxc: { jsx: { importSource: "solid-js" } },
		plugins: [
			tsconfigPaths(),
			solid(),
			tailwindcss(),
			legacy(),
			createChecker(mode),
		],
	};
});

function createChecker(mode: string) {
	if (mode !== "development") return undefined;

	return checker({
		overlay: { initialIsOpen: false },
		typescript: true,
	});
}
