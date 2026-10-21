import { RouterProvider, createRouter } from "@tanstack/solid-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { attachConsole } from "@tauri-apps/plugin-log";
import { render } from "solid-js/web";

import "./index.css";
import {
	SystemStatsProvider,
	createSystemStatsStore,
	startEventListeners,
} from "./hooks/system-stats";
import { routeTree } from "./route-tree.gen";

function createTanstackRouter() {
	return createRouter({ routeTree });
}

declare module "@tanstack/solid-router" {
	interface Register {
		router: ReturnType<typeof createTanstackRouter>;
	}
}

async function renderAndShow() {
	const appRoot = document.querySelector("#app-root");

	// makes sense to panic if no app mount available
	// oxlint-disable-next-line eslint-js/no-restricted-syntax
	if (!appRoot) throw new Error("#app-root not found");

	const systemStatsStore = createSystemStatsStore();
	const router = createTanstackRouter();

	void startEventListeners(systemStatsStore);

	// enables @wdio/tauri-service. throws if window.__TAURI__ is unavailable
	// (i.e. withGlobalTauri disabled), so never import this outside e2e.
	if (import.meta.env.VITE_E2E) await import("@wdio/tauri-plugin");

	render(() => {
		return (
			<SystemStatsProvider store={systemStatsStore}>
				<RouterProvider router={router} />
			</SystemStatsProvider>
		);
	}, appRoot);

	// workaround white flash on start.
	// see: https://github.com/tauri-apps/tauri/issues/5170
	void getCurrentWindow().show();
}

async function start() {
	if (import.meta.env.DEV) {
		try {
			await attachConsole();
		} catch (cause) {
			// oxlint-disable-next-line no-console
			console.error("Could not attach the Tauri console", cause);
		}
	}

	await renderAndShow();
}

void start().catch((cause: unknown) => {
	// oxlint-disable-next-line no-console
	console.error("Could not initialize the frontend", cause);
});
