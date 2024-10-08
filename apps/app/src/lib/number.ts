// https://stackoverflow.com/a/54409977
export function divBigint(
	dividend: bigint,
	divisor: bigint,
	precision = BigInt(100),
) {
	return Number((dividend * precision) / divisor) / Number(precision);
}

export function normalizeBigint(val: bigint, min: bigint, max: bigint) {
	return divBigint(val - min, max - min);
}
