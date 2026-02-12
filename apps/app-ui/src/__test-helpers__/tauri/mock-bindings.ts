// oxlint-disable no-null, prefer-await-to-then, catch-or-return

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
} from "shared/__generated__/tauri/bindings";

export const commands: typeof bindingsCommands = {
	getSystemInfo: vi.fn(() => Promise.resolve(createMockSystemInfo())),
	getSystemStats: vi.fn(() => {
		return Promise.resolve(createMockOkResult(createMockSystemStats()));
	}),
	getThemePreference: vi.fn(() => Promise.resolve("System" as const)),
	setThemePreference: vi.fn(() => Promise.resolve()),
	openUserDir: vi.fn(() => Promise.resolve(createMockOkResult(null))),
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
