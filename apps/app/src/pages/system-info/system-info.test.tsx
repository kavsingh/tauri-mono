import { render, waitFor, screen, cleanup } from "@solidjs/testing-library";
import { describe, it, expect, vi, afterEach } from "vitest";

import { createMockSystemInfo } from "#__test-helpers__/mock-data/create";
import { setupRenderWrapper } from "#__test-helpers__/render-wrapper";
import { publishSystemInfoEvent } from "#__test-helpers__/tauri/events";

import SystemInfoPage from "./index";

describe("<SystemInfoPage />", () => {
	afterEach(() => {
		vi.clearAllMocks();
		cleanup();
	});

	it("should load and render system info", async () => {
		expect.assertions(4);

		const { Wrapper } = setupRenderWrapper();

		render(() => <SystemInfoPage />, { wrapper: Wrapper });

		expect(
			screen.getByRole("heading", { name: "System Info", level: 2 }),
		).toBeInTheDocument();
		expect(screen.getByText("Loading...")).toBeInTheDocument();
		expect(screen.queryByText("1.00 GB")).not.toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText("1.00 GB")).toBeInTheDocument();
		});

		expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
	});

	it("should update from system info events", async () => {
		expect.assertions(4);

		const { Wrapper } = setupRenderWrapper();

		render(() => <SystemInfoPage />, { wrapper: Wrapper });

		await waitFor(() => {
			expect(screen.getByText("1.00 MB")).toBeInTheDocument();
		});

		expect(screen.queryByText("2.00 MB")).not.toBeInTheDocument();

		publishSystemInfoEvent(
			createMockSystemInfo({ memAvailable: String(1024 * 1024 * 2) }),
		);

		await waitFor(() => {
			expect(screen.getByText("2.00 MB")).toBeInTheDocument();
		});

		expect(screen.queryByText("1.00 MB")).not.toBeInTheDocument();
	});
});
