import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { RouterProvider, createRouter } from "@tanstack/solid-router";
import { invoke } from "@tauri-apps/api/core";
import { attachConsole } from "@tauri-apps/plugin-log";
import { render } from "solid-js/web";

import "./index.css";
import { routeTree } from "./route-tree.gen";
import { startEventListeners } from "./services/tauri";

function createTanstackRouter() {
	return createRouter({ routeTree });
}

declare module "@tanstack/solid-router" {
	interface Register {
		router: ReturnType<typeof createTanstackRouter>;
	}
}

declare global {
	interface Window {
		__REMOTE_LOAD_ID__?: string;
	}
}

async function renderAndNotifyReady() {
	const appRoot = document.querySelector("#app-root");

	// makes sense to panic if no app mount available
	// oxlint-disable-next-line eslint-js/no-restricted-syntax
	if (!appRoot) throw new Error("#app-root not found");

	const client = new QueryClient();
	const router = createTanstackRouter();

	void startEventListeners(client);

	// enables @wdio/tauri-service. throws if window.__TAURI__ is unavailable
	// (i.e. withGlobalTauri disabled), so never import this outside e2e.
	if (import.meta.env.VITE_E2E) await import("@wdio/tauri-plugin");

	render(() => {
		return (
			<QueryClientProvider client={client}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		);
	}, appRoot);

	if (window.__REMOTE_LOAD_ID__) {
		await invoke("remote_ready", { loadId: window.__REMOTE_LOAD_ID__ });
	}
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
	await renderAndNotifyReady();
}

void start().catch((cause: unknown) => {
	// oxlint-disable-next-line no-console
	console.error("Could not initialize the frontend", cause);
});
