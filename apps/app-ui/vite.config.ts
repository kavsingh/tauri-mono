import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import { checker } from "vite-plugin-checker";
import solid from "vite-plugin-solid";

export default defineConfig(({ mode }) => {
	return {
		server: { port: 5321, host: "0.0.0.0" },
		resolve: { conditions: ["browser", mode], tsconfigPaths: true },
		oxc: { jsx: { importSource: "solid-js" } },
		plugins: [
			devtools(),
			tanstackRouter(),
			solid(),
			tailwindcss(),
			mode === "development"
				? checker({ oxlint: true, overlay: { initialIsOpen: false } })
				: undefined,
		],
	};
});
