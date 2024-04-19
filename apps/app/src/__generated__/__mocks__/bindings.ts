import { type WebviewWindowHandle } from "@tauri-apps/api/window";
import { vi } from "vitest";

import { createMockSystemInfo } from "#__test-helpers__/mock-data/create";

import type {
	commands as bindingsCommands,
	events as bindingsEvents,
} from "#__generated__/bindings";

export const commands: typeof bindingsCommands = {
	getSystemInfo: vi.fn(() => Promise.resolve(createMockSystemInfo())),
};

export const events: Record<
	keyof typeof bindingsEvents,
	ReturnType<typeof mockEventHandles>
> = {
	systemInfoEvent: mockEventHandles(),
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
