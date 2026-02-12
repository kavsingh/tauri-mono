import { Webview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { attachConsole } from "@tauri-apps/plugin-log";

import { createScopedLogger } from "./logger";

import type { Window } from "@tauri-apps/api/window";

const logger = createScopedLogger("entry");

if (import.meta.env.DEV) {
	// oxlint-disable-next-line prefer-top-level-await, prefer-await-to-then
	void attachConsole().then(renderAndShow);
} else {
	void renderAndShow();
}

async function renderAndShow() {
	logger.debug("render and show");

	const appWindow = getCurrentWindow();

	// workaround white flash on start.
	// see: https://github.com/tauri-apps/tauri/issues/5170
	await appWindow.show();

	attachRemoteWebview(appWindow);
}

function attachRemoteWebview(parentWindow: Window) {
	logger.info("creating and attaching remote web view");

	// `new Webview` Should be called after the window is successfully created,
	// or webview may not be attached to the window since window is not created yet.
	const webview = new Webview(parentWindow, "remoteContentView", {
		url: "http://localhost:5321",
		// create a webview with specific logical position and size
		x: 0,
		y: 0,
		// parentWindow.innerSize returns some wild numbers
		width: document.documentElement.clientWidth,
		height: document.documentElement.clientHeight,
	});

	void webview.once("tauri://created", (event) => {
		logger.info("created:", event.payload);

		void webview.setAutoResize(true);
	});

	void webview.once("tauri://error", (event) => {
		logger.error("error:", event.payload);
	});
}
