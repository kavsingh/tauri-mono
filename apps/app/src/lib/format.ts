import { tryOr } from "./error";
import { divBigint } from "./number";

export function formatMem(value: string | number | bigint) {
	const mem = tryOr(() => BigInt(value), BigInt(0));

	for (const [threshold, unit] of memoryThresholds) {
		if (mem < threshold) continue;

		return `${divBigint(mem, threshold).toFixed(2)} ${unit}`;
	}

	return "-";
}

const memoryThresholds = [
	[BigInt(1024 * 1024 * 1024), "GB"],
	[BigInt(1024 * 1024), "MB"],
	[BigInt(1024), "KB"],
	[BigInt(0), "B"],
] as const;
