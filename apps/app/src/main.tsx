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

function renderAndShow() {
	const appRoot = document.querySelector("#app-root");

	// makes sense to panic if no app mount available
	// oxlint-disable-next-line eslint-js/no-restricted-syntax
	if (!appRoot) throw new Error("#app-root not found");

	const systemStatsStore = createSystemStatsStore();
	const router = createTanstackRouter();

	void startEventListeners(systemStatsStore);

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

if (import.meta.env.DEV) void attachConsole().then(renderAndShow);
else renderAndShow();
