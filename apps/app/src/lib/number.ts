import { err, ok } from "neverthrow";

import type { Result } from "neverthrow";

// https://stackoverflow.com/a/54409977
export function divBigint(
	dividend: bigint,
	divisor: bigint,
	precision = 100n,
): Result<number, Error> {
	if (divisor === 0n) return err(new Error("Division by zero"));

	const result = Number((dividend * precision) / divisor) / Number(precision);

	return Number.isFinite(result)
		? ok(result)
		: err(new Error("Result is not finite"));
}

export function normalizeBigint(
	val: bigint,
	min: bigint,
	max: bigint,
): Result<number, Error> {
	return divBigint(val - min, max - min);
}
