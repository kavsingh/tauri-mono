import { render, waitFor, screen, cleanup } from "@solidjs/testing-library";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import {
	RouterProvider,
	createMemoryHistory,
	createRouter,
} from "@tanstack/solid-router";
import { describe, it, expect, vi, afterEach } from "vitest";

import { createMockSystemStats } from "~/__test-helpers__/mock-data/system";
import { publishSystemStatsEvent } from "~/__test-helpers__/tauri/events";
import { routeTree } from "~/route-tree.gen";
import { startEventListeners } from "~/services/tauri";

async function setup() {
	const client = new QueryClient();
	const history = createMemoryHistory({ initialEntries: ["/"] });
	const router = createRouter({ routeTree, history });

	const dispose = await startEventListeners(client);

	return { client, router, dispose };
}

describe("<Index />", () => {
	afterEach(() => {
		vi.clearAllMocks();
		cleanup();
	});

	it("should load and render home page", async () => {
		const { client, router, dispose } = await setup();

		render(() => (
			<QueryClientProvider client={client}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		));
		await router.load();

		expect(
			screen.getByRole("heading", { name: "Home", level: 2 }),
		).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText("1.00 GB")).toBeInTheDocument();
		});

		expect(screen.queryByText("loading...")).not.toBeInTheDocument();

		dispose();
	});

	it("should update system stats from events", async () => {
		const { client, router, dispose } = await setup();

		render(() => (
			<QueryClientProvider client={client}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		));
		await router.load();

		await waitFor(() => {
			expect(screen.getByText("600.00 MB")).toBeInTheDocument();
		});

		expect(screen.queryByText("500.00 MB")).not.toBeInTheDocument();

		publishSystemStatsEvent(
			createMockSystemStats({
				memUsed: String(1024 * 1024 * 500),
				sampledAt: "1",
			}),
		);

		await waitFor(() => {
			expect(screen.getByText("500.00 MB")).toBeInTheDocument();
		});

		expect(screen.queryByText("600.00 MB")).not.toBeInTheDocument();

		dispose();
	});
});
