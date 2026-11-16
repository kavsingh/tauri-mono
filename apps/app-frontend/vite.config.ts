import { styleText } from "node:util";

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import { checker } from "vite-plugin-checker";
import solid from "vite-plugin-solid";

export default defineConfig(({ mode }) => {
	const isE2E = process.env["VITE_E2E"] === "true";

	if (isE2E) console.log(styleText(["yellow", "bold"], "Building for E2E"));

	return {
		server: { port: 5321, host: "0.0.0.0" },
		resolve: { conditions: ["browser", mode], tsconfigPaths: true },
		oxc: { jsx: { importSource: "solid-js" } },
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
			solid(),
			tailwindcss(),
			mode === "development" && !isE2E
				? checker({ oxlint: true, overlay: { initialIsOpen: false } })
				: undefined,
		],
	};
});
