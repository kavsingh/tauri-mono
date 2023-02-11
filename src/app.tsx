import { Router, hashIntegration, Route, Routes, A } from "@solidjs/router";
import { onMount } from "solid-js";

import Files from "./screens/files";
import SysInfo from "./screens/sys-info";

import type { Component } from "solid-js";

const App: Component = () => {
	// workaround white flash on start.
	// see: https://github.com/tauri-apps/tauri/issues/5170
	onMount(() => void showAppWindow());

	return (
		<Router source={hashIntegration()}>
			<div class="bg-primary p-4 text-primary min-bs-full">
				<nav>
					<A href="/">Sys info</A>
					<A href="/files">File select</A>
				</nav>
				<Routes>
					<Route path="/" component={SysInfo} />
					<Route path="/files" component={Files} />
				</Routes>
			</div>
		</Router>
	);
};

export default App;

async function showAppWindow() {
	const { appWindow } = await import("@tauri-apps/api/window");

	void appWindow.show();
}
