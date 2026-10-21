import { Result } from "effect";

// https://stackoverflow.com/a/54409977
function divBigint(
	dividend: bigint,
	divisor: bigint,
	precision = 100n,
): Result.Result<number, Error> {
	if (divisor === 0n) return Result.fail(new Error("Division by zero"));

	const result = Number((dividend * precision) / divisor) / Number(precision);

	return Number.isFinite(result)
		? Result.succeed(result)
		: Result.fail(new Error("Result is not finite"));
}

function normalizeBigint(
	val: bigint,
	min: bigint,
	max: bigint,
): Result.Result<number, Error> {
	return divBigint(val - min, max - min);
}

export { divBigint, normalizeBigint };
