import { render, waitFor, screen, cleanup } from "@solidjs/testing-library";
import {
	RouterProvider,
	createMemoryHistory,
	createRouter,
} from "@tanstack/solid-router";
import { describe, it, expect, vi, afterEach } from "vitest";

import { createMockSystemStats } from "~/__test-helpers__/mock-data/system";
import { publishSystemStatsEvent } from "~/__test-helpers__/tauri/events";
import {
	SystemStatsProvider,
	createSystemStatsStore,
	startEventListeners,
} from "~/hooks/system-stats";
import { routeTree } from "~/route-tree.gen";

import type { ParentProps } from "solid-js";

async function setup() {
	const store = createSystemStatsStore();
	const history = createMemoryHistory({ initialEntries: ["/"] });
	const router = createRouter({ routeTree, history });

	function Wrapper(props: ParentProps) {
		return (
			<SystemStatsProvider store={store}>{props.children}</SystemStatsProvider>
		);
	}

	const dispose = await startEventListeners(store);

	return { router, Wrapper, dispose };
}

describe("<Index />", () => {
	afterEach(() => {
		vi.clearAllMocks();
		cleanup();
	});

	it("should load and render home page", async () => {
		const { router, Wrapper, dispose } = await setup();

		render(() => <RouterProvider router={router} />, { wrapper: Wrapper });
		await router.load();

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: "Home", level: 2 }),
			).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByText("1.00 GB")).toBeInTheDocument();
		});

		expect(screen.queryByText("loading...")).not.toBeInTheDocument();

		dispose();
	});

	it("should update system stats from events", async () => {
		const { router, Wrapper, dispose } = await setup();

		render(() => <RouterProvider router={router} />, { wrapper: Wrapper });
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
