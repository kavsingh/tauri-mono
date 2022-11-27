import "./style/global-style.css";

import { Router, hashIntegration, Route, Routes, A } from "@solidjs/router";

import { uiRootStyle } from "./app.css";
import FileSelect from "./screens/file-select";
import SysInfo from "./screens/sys-info";
import themeStore from "./style/theme-store";

import type { Component } from "solid-js";

const App: Component = () => (
	<Router source={hashIntegration()}>
		<div classList={{ [themeStore.theme()]: true, [uiRootStyle]: true }}>
			<nav>
				<A href="/">Sys info</A>
				<A href="/files">File select</A>
			</nav>
			<Routes>
				<Route path="/" component={SysInfo} />
				<Route path="/files" component={FileSelect} />
			</Routes>
		</div>
	</Router>
);

export default App;
