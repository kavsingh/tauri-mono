import { tauri } from "@tauri-apps/api";
import { describe, afterEach, it, expect, vi } from "vitest";

import { invoker } from "./invoke";

vi.mock("@tauri-apps/api", () => ({
	tauri: { invoke: vi.fn(() => Promise.resolve()) },
}));

describe("invoke", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("provides a typed wrapper around invoke", async () => {
		void (await invoker("get_sys_info")());

		expect(tauri.invoke).toHaveBeenCalledWith("get_sys_info", undefined);
	});
});
