import { Route, HashRouter } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { createEffect } from "solid-js";

import { usePrefersDark } from "./hooks/theme";
import AppLayout from "./layouts/app";
import Files from "./pages/files";
import Home from "./pages/home";
import Settings from "./pages/settings";

export default function App() {
	const prefersDark = usePrefersDark();

	createEffect(() => {
		document.documentElement.classList.toggle("dark", prefersDark());
	});

	return (
		<QueryClientProvider client={new QueryClient()}>
			<HashRouter root={AppLayout}>
				<Route path="/" component={Home} />
				<Route path="/files" component={Files} />
				<Route path="/settings" component={Settings} />
			</HashRouter>
		</QueryClientProvider>
	);
}
