// https://stackoverflow.com/a/54409977
export function divBigint(dividend: bigint, divisor: bigint, precision = 100n) {
	return Number((dividend * precision) / divisor) / Number(precision);
}
