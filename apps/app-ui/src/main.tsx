import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { RouterProvider, createRouter } from "@tanstack/solid-router";
import { render } from "solid-js/web";

import "./index.css";
import { routeTree } from "./route-tree.gen.ts";
import { startEventListeners } from "./services/tauri";

const client = new QueryClient();
const router = createRouter({ routeTree });

declare module "@tanstack/solid-router" {
	interface Register {
		router: typeof router;
	}
}

const appRoot = document.querySelector("#app-root");

if (!appRoot) throw new Error("#app-root not found");

function App() {
	return (
		<QueryClientProvider client={client}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	);
}

void startEventListeners(client);
render(() => <App />, appRoot);
