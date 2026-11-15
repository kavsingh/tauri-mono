// oxlint-disable no-unassigned-import

import "@testing-library/jest-dom/vitest";
import "vitest-canvas-mock";
import { vi } from "vitest";

import { commands, events } from "~/__test-helpers__/tauri/mock-bindings";

vi.mock(import("@tauri-apps/plugin-log"), () => ({
	trace: vi.fn(),
	debug: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	attachConsole: vi.fn(),
}));

vi.mock(import("shared/tauri-bindings.gen"), () => ({ commands, events }));

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
