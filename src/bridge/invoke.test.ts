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
    void (await invoker("select_files")());

    expect(tauri.invoke).toHaveBeenCalledWith("select_files");
  });
});
