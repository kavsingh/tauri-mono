import { styleText } from "node:util";

import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import { checker } from "vite-plugin-checker";

export default defineConfig(({ mode }) => {
	const isE2E = process.env["VITE_E2E"] === "true";

	if (isE2E) console.log(styleText(["yellow", "bold"], "Building for E2E"));

	return {
		server: { port: 5321, host: "0.0.0.0" },
		resolve: { conditions: ["browser", mode], tsconfigPaths: true },
		define: {
			"import.meta.env.VITE_E2E": JSON.stringify(isE2E),
			"import.meta.env.VITE_FRONTEND_BUILD_ID": JSON.stringify(
				process.env["VITE_FRONTEND_BUILD_ID"] ?? "development",
			),
			"import.meta.env.VITE_NATIVE_API_VERSION": "1",
		},
		plugins: [
			devtools(),
			tanstackRouter(),
			solid({ start: false }),
			tailwindcss(),
			mode === "development" && !isE2E
				? checker({ oxlint: true, overlay: { initialIsOpen: false } })
				: undefined,
		],
		// @TODO: remove when possible
		alias: { "solid-js/web": "@solidjs/web", "solid-js/store": "solid-js" },
		optimizeDeps: {
			// Prevents Vite's esbuild/rolldown pre-bundler from choking on Solid source files in node_modules
			exclude: ["@tanstack/solid-query", "@tanstack/solid-router"],
		},
	};
});
