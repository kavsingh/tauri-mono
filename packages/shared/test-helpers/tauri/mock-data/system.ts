import { mockCreator } from "./mock-creator.ts";

import type {
	SystemInfo,
	SystemStats,
} from "../../../__generated__/tauri/bindings.ts";

export const createMockSystemInfo = mockCreator<SystemInfo>({
	osFullname: "OS Fullname",
	osArch: "OS Arch",
});

export const createMockSystemStats = mockCreator<SystemStats>({
	memTotal: String(1024 * 1024 * 1024),
	memUsed: String(1024 * 1024 * 600),
	memAvailable: String(1024 * 1024 * 400),
	sampledAt: "0",
});
