import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { RouterProvider, createRouter } from "@tanstack/solid-router";

import "./index.css";
import { render } from "solid-js/web";

import { routeTree } from "./route-tree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/solid-router" {
	interface Register {
		router: typeof router;
	}
}

const appRoot = document.querySelector("#app-root");

if (!appRoot) throw new Error("#app-root not found");

render(() => <App />, appRoot);

function App() {
	return (
		<QueryClientProvider client={new QueryClient()}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	);
}
