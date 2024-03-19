import { appWindow } from "@tauri-apps/api/window";
import { render } from "solid-js/web";

import "./index.css";
import App from "./app";

// workaround white flash on start.
// see: https://github.com/tauri-apps/tauri/issues/5170
void appWindow.show();

const appRoot = document.getElementById("app-root");

if (!appRoot) throw new Error("#app-root not found");

render(() => <App />, appRoot);
