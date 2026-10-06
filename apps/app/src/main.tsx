import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { RouterProvider, createRouter } from "@tanstack/solid-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { attachConsole } from "@tauri-apps/plugin-log";
import { render } from "solid-js/web";

import "./index.css";
import { routeTree } from "./route-tree.gen.ts";
import { startEventListeners } from "./services/tauri";

function createTanstackRouter() {
	return createRouter({ routeTree });
}

declare module "@tanstack/solid-router" {
	interface Register {
		router: ReturnType<typeof createTanstackRouter>;
	}
}

function renderAndShow() {
	const appRoot = document.querySelector("#app-root");

	// makes sense to panic if no app mount available
	// oxlint-disable-next-line eslint-js/no-restricted-syntax
	if (!appRoot) throw new Error("#app-root not found");

	const client = new QueryClient();
	const router = createTanstackRouter();

	void startEventListeners(client);

	// enables @wdio/tauri-service. throws if window.__TAURI__ is unavailable
	// (i.e. withGlobalTauri disabled), so never import this outside e2e.
	if (import.meta.env.VITE_E2E === "true") void import("@wdio/tauri-plugin");

	render(() => {
		return (
			<QueryClientProvider client={client}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		);
	}, appRoot);

	// workaround white flash on start.
	// see: https://github.com/tauri-apps/tauri/issues/5170
	void getCurrentWindow().show();
}

if (import.meta.env.DEV) void attachConsole().then(renderAndShow);
else renderAndShow();
