import { vi } from "vitest";

import {
	createMockSystemInfo,
	createMockSystemStats,
} from "#__test-helpers__/mock-data/system";

import type { WebviewWindowHandle } from "@tauri-apps/api/window";
import type {
	commands as bindingsCommands,
	events as bindingsEvents,
} from "#__generated__/bindings";

export const commands: typeof bindingsCommands = {
	getSystemInfo: vi.fn(() => Promise.resolve(createMockSystemInfo())),
	getSystemStats: vi.fn(() => Promise.resolve(createMockSystemStats())),
};

export const events: Record<
	keyof typeof bindingsEvents,
	ReturnType<typeof mockEventHandles>
> = {
	systemStatsEvent: mockEventHandles(),
};

function mockEventHandles(): {
	listen(arg: unknown): ReturnType<WebviewWindowHandle["listen"]>;
	once(arg: unknown): ReturnType<WebviewWindowHandle["once"]>;
	emit(arg: unknown): ReturnType<WebviewWindowHandle["emit"]>;
} {
	return {
		listen: vi.fn(() => Promise.resolve(() => undefined)),
		once: vi.fn(() => Promise.resolve(() => undefined)),
		emit: vi.fn(() => Promise.resolve()),
	};
}
