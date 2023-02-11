import { Router, hashIntegration, Route, Routes, A } from "@solidjs/router";

import Files from "./screens/files";
import SysInfo from "./screens/sys-info";

import type { Component } from "solid-js";

const App: Component = () => (
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

export default App;
