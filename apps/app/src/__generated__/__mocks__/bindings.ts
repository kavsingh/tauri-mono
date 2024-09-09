import { vi } from "vitest";

import {
	createMockSystemInfo,
	createMockSystemStats,
} from "#__test-helpers__/mock-data/system";
import { createMockOkResult } from "#__test-helpers__/tauri/commands";

import type {
	commands as bindingsCommands,
	events as bindingsEvents,
} from "#__generated__/bindings";
import type { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export const commands: typeof bindingsCommands = {
	getSystemInfo: vi.fn(() => Promise.resolve(createMockSystemInfo())),
	getSystemStats: vi.fn(() => {
		return Promise.resolve(createMockOkResult(createMockSystemStats()));
	}),
};

export const events: Record<
	keyof typeof bindingsEvents,
	ReturnType<typeof mockEventHandles>
> = {
	systemStatsEvent: mockEventHandles(),
};

function mockEventHandles(): {
	listen(arg: unknown): ReturnType<WebviewWindow["listen"]>;
	once(arg: unknown): ReturnType<WebviewWindow["once"]>;
	emit(arg: unknown): ReturnType<WebviewWindow["emit"]>;
} {
	return {
		listen: vi.fn(() => Promise.resolve(() => undefined)),
		once: vi.fn(() => Promise.resolve(() => undefined)),
		emit: vi.fn(() => Promise.resolve()),
	};
}
