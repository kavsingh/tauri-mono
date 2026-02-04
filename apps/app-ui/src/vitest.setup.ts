// oxlint-disable no-unassigned-import

import "@testing-library/jest-dom/vitest";
import "vitest-canvas-mock";
import { vi } from "vitest";

import { commands, events } from "#__test-helpers__/tauri/mock-bindings";

vi.mock("shared/__generated__/tauri/bindings", () => ({
	commands,
	events,
}));

vi.stubGlobal(
	"ResizeObserver",
	class MockResizeObserver {
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
	},
);

vi.stubGlobal(
	"matchMedia",
	vi.fn(() => ({ addEventListener: vi.fn(), removeEventListener: vi.fn() })),
);
