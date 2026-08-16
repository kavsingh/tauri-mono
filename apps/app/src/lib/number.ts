import { Either } from "effect";

// https://stackoverflow.com/a/54409977
function divBigint(
	dividend: bigint,
	divisor: bigint,
	precision = 100n,
): Either.Either<number, Error> {
	if (divisor === 0n) return Either.left(new Error("Division by zero"));

	const result = Number((dividend * precision) / divisor) / Number(precision);

	return Number.isFinite(result)
		? Either.right(result)
		: Either.left(new Error("Result is not finite"));
}

function normalizeBigint(
	val: bigint,
	min: bigint,
	max: bigint,
): Either.Either<number, Error> {
	return divBigint(val - min, max - min);
}

export { divBigint, normalizeBigint };
