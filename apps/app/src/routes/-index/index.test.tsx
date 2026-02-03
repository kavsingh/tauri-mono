import { render, waitFor, screen, cleanup } from "@solidjs/testing-library";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { describe, it, expect, vi, afterEach } from "vitest";

import { createMockSystemStats } from "#__test-helpers__/mock-data/system";
import { publishSystemStatsEvent } from "#__test-helpers__/tauri/events";
import { Index } from "#routes/index";

import type { ParentProps } from "solid-js";

describe("<Index />", () => {
	afterEach(() => {
		vi.clearAllMocks();
		cleanup();
	});

	it("should load and render home page", async () => {
		expect.assertions(4);

		render(() => <Index />, { wrapper: setup().Wrapper });

		expect(
			screen.getByRole("heading", { name: "Home", level: 2 }),
		).toBeInTheDocument();
		expect(screen.queryByText("1.00 GB")).not.toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText("1.00 GB")).toBeInTheDocument();
		});

		expect(screen.queryByText("loading...")).not.toBeInTheDocument();
	});

	it("should update system stats from events", async () => {
		expect.assertions(4);

		render(() => <Index />, { wrapper: setup().Wrapper });

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
	});
});

function setup() {
	const client = new QueryClient();

	function Wrapper(props: ParentProps) {
		return (
			<QueryClientProvider client={client}>
				{props.children}
			</QueryClientProvider>
		);
	}

	return { Wrapper, client };
}
