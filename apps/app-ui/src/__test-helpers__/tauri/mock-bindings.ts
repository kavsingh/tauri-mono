import { createMockOkResult } from "shared/test-helpers/tauri/commands";
import {
	createMockSystemInfo,
	createMockSystemStats,
} from "shared/test-helpers/tauri/mock-data/system";
import { vi } from "vitest";

import type { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import type {
	commands as bindingsCommands,
	events as bindingsEvents,
} from "shared/tauri-bindings.gen";

type BindingsEvents = typeof bindingsEvents;

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
	openUserDir: vi.fn(() => Promise.resolve(createMockOkResult(null))),
};

// oxlint-disable typescript/no-unsafe-type-assertion
const events: typeof bindingsEvents = {
	systemStatsEvent: mockEventHandles() as BindingsEvents["systemStatsEvent"],
};
// oxlint-enable typescript/no-unsafe-type-assertion

export { commands, events };
