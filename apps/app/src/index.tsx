import { getCurrent } from "@tauri-apps/api/window";
import { render } from "solid-js/web";

import "./index.css";
import App from "./app";

// workaround white flash on start.
// see: https://github.com/tauri-apps/tauri/issues/5170
void getCurrent().show();

const appRoot = document.getElementById("app-root");

if (!appRoot) throw new Error("#app-root not found");

const dispose = render(() => <App />, appRoot);

if (import.meta.hot) import.meta.hot.dispose(dispose);
