import { Result } from "neverthrow";

import { divBigint } from "./number.ts";

const memoryThresholds = [
	[BigInt(1024 * 1024 * 1024), "GB"],
	[BigInt(1024 * 1024), "MB"],
	[1024n, "KB"],
	[0n, "B"],
] as const;

export function formatMem(value: string | number | bigint): string {
	const mem = Result.fromThrowable(BigInt)(value).unwrapOr(0n);

	for (const [threshold, unit] of memoryThresholds) {
		if (mem < threshold) continue;

		return divBigint(mem, threshold)
			.map((result) => `${result.toFixed(2)} ${unit}`)
			.unwrapOr("-");
	}

	return "-";
}
