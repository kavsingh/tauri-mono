import { getCurrentWindow } from "@tauri-apps/api/window";
import { attachConsole } from "@tauri-apps/plugin-log";
import { render } from "solid-js/web";

import "./index.css";
import { App } from "./app";

if (import.meta.env.DEV) {
	// oxlint-disable-next-line prefer-top-level-await, prefer-await-to-then
	void attachConsole().then(renderAndShow);
} else {
	renderAndShow();
}

function renderAndShow() {
	const appRoot = document.querySelector("#app-root");

	if (!appRoot) throw new Error("#app-root not found");

	render(() => <App />, appRoot);

	// workaround white flash on start.
	// see: https://github.com/tauri-apps/tauri/issues/5170
	void getCurrentWindow().show();
}
