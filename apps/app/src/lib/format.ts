import { divBigint } from "./math";

export function formatMem(memString: string) {
	const mem = BigInt(memString);

	for (const [threshold, unit] of memoryThresholds) {
		if (mem >= threshold) {
			return `${divBigint(mem, threshold).toFixed(2)} ${unit}`;
		}
	}

	return "-";
}

const memoryThresholds = [
	[BigInt(1024 * 1024 * 1024), "GB"],
	[BigInt(1024 * 1024), "MB"],
	[1024n, "KB"],
	[0n, "B"],
] as const;
