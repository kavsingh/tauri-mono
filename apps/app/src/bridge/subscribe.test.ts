import { listen } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";
import { describe, afterEach, it, expect, vi } from "vitest";

import { subscribeGlobal, subscribeWindow } from "./subscribe";

import type { HeartbeatEvent } from "#__generated__/bindings/heartbeat-event";
import type { Mock } from "vitest";

vi.mock("@tauri-apps/api/event", () => ({
	listen: vi.fn(() => Promise.resolve(vi.fn())),
}));

vi.mock("@tauri-apps/api/window", () => ({
	appWindow: { listen: vi.fn(() => Promise.resolve(vi.fn())) },
}));

describe("invoke", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("subscribeGlobal", () => {
		it("provides a typed subscription to global events", () => {
			expect.assertions(2);

			const accum: HeartbeatEvent[] = [];

			subscribeGlobal("heartbeat", (event) => {
				accum.push(event.payload);
			});

			const handler = (listen as Mock).mock.calls.at(-1).at(-1);

			handler({ payload: { message: "one", timestamp: 1 } });
			handler({ payload: { message: "two", timestamp: 2 } });

			expect(accum).toHaveLength(2);
			expect(accum.at(-1)).toStrictEqual({ message: "two", timestamp: 2 });
		});

		it.todo("test unsubscribe somehow");
	});

	describe("subscribeWindow", () => {
		it("provides a typed subscription to window events", () => {
			expect.assertions(2);

			const accum: HeartbeatEvent[] = [];

			subscribeWindow("heartbeat", (event) => {
				accum.push(event.payload);
			});

			const handler = (appWindow.listen as Mock).mock.calls.at(-1).at(-1);

			handler({ payload: { message: "one", timestamp: 1 } });
			handler({ payload: { message: "two", timestamp: 2 } });

			expect(accum).toHaveLength(2);
			expect(accum.at(-1)).toStrictEqual({ message: "two", timestamp: 2 });
		});

		it.todo("test unsubscribe somehow");
	});
});
