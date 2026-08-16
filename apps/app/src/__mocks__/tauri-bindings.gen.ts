import { vi } from "vitest";

import {
	createMockSystemInfo,
	createMockSystemStats,
} from "~/__test-helpers__/mock-data/system";
import { createMockOkResult } from "~/__test-helpers__/tauri/commands";

import type { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import type {
	commands as bindingsCommands,
	events as bindingsEvents,
} from "~/tauri-bindings.gen";

interface MockEventHandles {
	listen(arg: unknown): ReturnType<WebviewWindow["listen"]>;
	once(arg: unknown): ReturnType<WebviewWindow["once"]>;
	emit(arg: unknown): ReturnType<WebviewWindow["emit"]>;
}

function mockEventHandles(): MockEventHandles {
	return {
		listen: vi.fn(() => Promise.resolve(() => undefined)),
		once: vi.fn(() => Promise.resolve(() => undefined)),
		emit: vi.fn(() => Promise.resolve()),
	};
}

const commands: typeof bindingsCommands = {
	getSystemInfo: vi.fn(() => Promise.resolve(createMockSystemInfo())),
	getSystemStats: vi.fn(() => {
		return Promise.resolve(createMockOkResult(createMockSystemStats()));
	}),
	getThemePreference: vi.fn(() => Promise.resolve("System" as const)),
	setThemePreference: vi.fn(() => Promise.resolve()),
};

const events: Record<keyof typeof bindingsEvents, MockEventHandles> = {
	systemStatsEvent: mockEventHandles(),
};

export { commands, events };
