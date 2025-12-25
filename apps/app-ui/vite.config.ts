import tailwindcss from "@tailwindcss/vite";
import legacy from "@vitejs/plugin-legacy";
import { defineConfig } from "rolldown-vite";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
	return {
		server: { port: 5321 },
		build:
			mode === "production"
				? { sourcemap: true, minify: "terser" }
				: { sourcemap: false, minify: false },
		oxc: { jsx: { importSource: "solid-js" } },
		plugins: [tsconfigPaths(), solid(), tailwindcss(), legacy()],
	};
});
