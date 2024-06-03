import type { SystemInfo, SystemStats } from "#__generated__/bindings";

export const createMockSystemInfo = mockDataCreator<SystemInfo>({
	osFullname: "OS Fullname",
	osArch: "OS Arch",
});

export const createMockSystemStats = mockDataCreator<SystemStats>({
	memTotal: String(1024 * 1024 * 1024),
	memUsed: String(1024 * 1024 * 600),
	memAvailable: String(1024 * 1024 * 400),
	sampledAt: String(new Date("2024-06-01").getTime()),
});

function mockDataCreator<TData>(defaults: TData) {
	return function createMockData(
		custom?: Partial<TData> | ((defaults: TData) => TData) | undefined,
	): TData {
		return typeof custom === "function"
			? custom(defaults)
			: { ...defaults, ...custom };
	};
}
