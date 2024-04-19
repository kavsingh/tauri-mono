import { type WebviewWindowHandle } from "@tauri-apps/api/window";
import { vi } from "vitest";

import { createMockSystemInfo } from "#__test-helpers__/mock-data/create";

import type { commands as cmd, events as ev } from "#__generated__/bindings";

export const commands: typeof cmd = {
	getSystemInfo: vi.fn(() => Promise.resolve(createMockSystemInfo())),
};

export const events: Record<keyof typeof ev, MockEventHandles> = {
	systemInfoEvent: mockEventHandles(),
};

function mockEventHandles(): MockEventHandles {
	return {
		listen: vi.fn(() => Promise.resolve(() => undefined)),
		once: vi.fn(() => Promise.resolve(() => undefined)),
		emit: vi.fn(() => Promise.resolve()),
	};
}

type MockEventHandles = {
	listen: (arg: unknown) => ReturnType<WebviewWindowHandle["listen"]>;
	once: (arg: unknown) => ReturnType<WebviewWindowHandle["once"]>;
	emit: (arg: unknown) => ReturnType<WebviewWindowHandle["emit"]>;
};
