import { render, waitFor, screen, cleanup } from "@solidjs/testing-library";
import { describe, it, expect, vi, afterEach } from "vitest";

import { events } from "#__generated__/bindings";
import { setupRenderWrapper } from "#__test-helpers__/render-wrapper";

import SystemInfoPage from "./index";

import type { SystemInfo } from "#__generated__/bindings";
import type { Mock } from "vitest";

vi.mock("#__generated__/bindings", () => ({
	commands: {
		getSystemInfo: vi.fn(() => Promise.resolve(createMockSystemInfo())),
	},
	events: {
		systemInfoEvent: {
			listen: vi.fn(() => Promise.resolve(() => undefined)),
		},
	},
}));

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

function publishSystemInfoEvent(payload: SystemInfo) {
	const calls = (events.systemInfoEvent.listen as Mock).mock.calls;

	for (const [maybeListener] of calls) {
		if (typeof maybeListener === "function") maybeListener({ payload });
	}
}

function createMockSystemInfo(info: Partial<SystemInfo> = {}): SystemInfo {
	return {
		osFullname: "OS Fullname",
		osArch: "OS Arch",
		memAvailable: String(1024 * 1024), // 1 MB
		memTotal: String(1024 * 1024 * 1024), // 1 GB
		...info,
	};
}
