import { render } from "@solidjs/web";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { RouterProvider, createRouter } from "@tanstack/solid-router";
import { attachConsole } from "@tauri-apps/plugin-log";

import "./index.css";
import { commands } from "shared/tauri-bindings.gen";

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
		try {
			await commands.remoteReady(
				window.__REMOTE_LOAD_ID__,
				import.meta.env.VITE_FRONTEND_BUILD_ID,
			);
		} catch (cause) {
			// oxlint-disable-next-line no-console
			console.error("Could not signal frontend readiness", cause);
		}
	}
}

async function start() {
	if (import.meta.env.DEV) {
		await attachConsole().catch((cause: unknown) => {
			// oxlint-disable-next-line no-console
			console.warn("Tauri console not available", cause);
		});
	}

	await renderAndNotifyReady();
}

void start().catch((cause: unknown) => {
	// oxlint-disable-next-line no-console
	console.error("Could not initialize the frontend", cause);
});
