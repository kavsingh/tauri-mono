import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { RouterProvider, createRouter } from "@tanstack/solid-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { attachConsole } from "@tauri-apps/plugin-log";
import { render } from "solid-js/web";

import "./index.css";
import { routeTree } from "./route-tree.gen";

if (import.meta.env.DEV) {
	// oxlint-disable-next-line prefer-top-level-await, prefer-await-to-then
	void attachConsole().then(renderAndShow);
} else {
	renderAndShow();
}

function createTanstackRouter() {
	return createRouter({ routeTree });
}

function renderAndShow() {
	const appRoot = document.querySelector("#app-root");

	if (!appRoot) throw new Error("#app-root not found");

	const client = new QueryClient();
	const router = createTanstackRouter();

	render(
		() => (
			<QueryClientProvider client={client}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		),
		appRoot,
	);

	// workaround white flash on start.
	// see: https://github.com/tauri-apps/tauri/issues/5170
	void getCurrentWindow().show();
}

declare module "@tanstack/solid-router" {
	interface Register {
		router: ReturnType<typeof createTanstackRouter>;
	}
}
