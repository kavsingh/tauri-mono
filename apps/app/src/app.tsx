import { Route, HashRouter } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { createEffect } from "solid-js";

import useUiTheme from "./hooks/use-ui-theme";
import AppLayout from "./layouts/app";
import Files from "./pages/files";
import Home from "./pages/home";
import Preferences from "./pages/preferences";

export default function App() {
	const theme = useUiTheme();

	createEffect(() => {
		document.documentElement.classList.toggle("dark", theme() === "dark");
	});

	return (
		<QueryClientProvider client={new QueryClient()}>
			<HashRouter root={AppLayout}>
				<Route path="/" component={Home} />
				<Route path="/files" component={Files} />
				<Route path="/preferences" component={Preferences} />
			</HashRouter>
		</QueryClientProvider>
	);
}
