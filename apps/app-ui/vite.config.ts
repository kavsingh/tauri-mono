import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "rolldown-vite";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
	return {
		server: { port: 5321, host: "0.0.0.0" },
		oxc: { jsx: { importSource: "solid-js" } },
		plugins: [tsconfigPaths(), tanstackRouter(), solid(), tailwindcss()],
	};
});
