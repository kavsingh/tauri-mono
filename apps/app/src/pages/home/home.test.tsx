import { render, waitFor, screen, cleanup } from "@solidjs/testing-library";
import { describe, it, expect, vi, afterEach } from "vitest";

import { createMockSystemStats } from "#__test-helpers__/mock-data/create";
import { setupRenderWrapper } from "#__test-helpers__/render-wrapper";
import { publishSystemStatsEvent } from "#__test-helpers__/tauri/events";

import Home from "./index";

describe("<Home />", () => {
	afterEach(() => {
		vi.clearAllMocks();
		cleanup();
	});

	it("should load and render home page", async () => {
		expect.assertions(5);

		const { Wrapper } = setupRenderWrapper();

		render(() => <Home />, { wrapper: Wrapper });

		expect(
			screen.getByRole("heading", { name: "Home", level: 2 }),
		).toBeInTheDocument();
		expect(screen.getByText("loading...")).toBeInTheDocument();
		expect(screen.queryByText("1.00 GB")).not.toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText("1.00 GB")).toBeInTheDocument();
		});

		expect(screen.queryByText("loading...")).not.toBeInTheDocument();
	});

	it("should update system stats from events", async () => {
		expect.assertions(4);

		const { Wrapper } = setupRenderWrapper();

		render(() => <Home />, { wrapper: Wrapper });

		await waitFor(() => {
			expect(screen.getByText("600.00 MB")).toBeInTheDocument();
		});

		expect(screen.queryByText("500.00 MB")).not.toBeInTheDocument();

		publishSystemStatsEvent(
			createMockSystemStats({ memUsed: String(1024 * 1024 * 500) }),
		);

		await waitFor(() => {
			expect(screen.getByText("500.00 MB")).toBeInTheDocument();
		});

		expect(screen.queryByText("600.00 MB")).not.toBeInTheDocument();
	});
});
