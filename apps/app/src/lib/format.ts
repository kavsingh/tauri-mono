import { Result } from "effect";

import { divBigint } from "./number.ts";

const memoryThresholds = [
	[BigInt(1024 * 1024 * 1024), "GB"],
	[BigInt(1024 * 1024), "MB"],
	[1024n, "KB"],
	[0n, "B"],
] as const;

export function formatMem(value: string | number | bigint): string {
	const mem = Result.try(() => BigInt(value)).pipe(Result.getOrElse(() => 0n));

	for (const [threshold, unit] of memoryThresholds) {
		if (mem < threshold) continue;

		return divBigint(mem, threshold).pipe(
			Result.map((result) => `${result.toFixed(2)} ${unit}`),
			Result.getOrElse(() => "-"),
		);
	}

	return "-";
}
