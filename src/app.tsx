import { Router, hashIntegration, Route, Routes } from "@solidjs/router";
import { onMount } from "solid-js";

import { invoker } from "./bridge/invoke";
import Masthead from "./components/masthead";
import WindowDragRegion from "./components/window-drag-region";
import Files from "./pages/files";
import SystemInfo from "./pages/system-info";

const initHeartbeat = invoker("init_heartbeat");

export default function App() {
	onMount(() => void initHeartbeat());

	return (
		<Router source={hashIntegration()}>
			<div class="bg-0 text-400 min-bs-full plb-8 pli-4">
				<WindowDragRegion />
				<Masthead />
				<Routes>
					<Route path="/" element={<SystemInfo />} />
					<Route path="/files" element={<Files />} />
				</Routes>
			</div>
		</Router>
	);
}
