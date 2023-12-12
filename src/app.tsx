import { Route, HashRouter } from "@solidjs/router";
import { onMount } from "solid-js";

import { initHeartbeat } from "ui:services/heartbeat";

import Masthead from "./components/masthead";
import WindowDragRegion from "./components/window-drag-region";
import Files from "./pages/files";
import SystemInfo from "./pages/system-info";

import type { ParentProps } from "solid-js";

export default function App() {
	onMount(() => void initHeartbeat());

	return (
		<HashRouter>
			<Route component={Root}>
				<Route path="/" component={SystemInfo} />
				<Route path="/files" component={Files} />
			</Route>
		</HashRouter>
	);
}

function Root(props: ParentProps) {
	return (
		<div class="min-h-full px-4 py-8">
			<WindowDragRegion />
			<Masthead />
			{props.children}
		</div>
	);
}
