type Result<TData, TError> =
	| { status: "ok"; data: TData }
	| { status: "error"; error: TError };

// oxlint-disable-next-line typescript/no-explicit-any
function handleResult<TData, TError, TArgs extends any[]>(
	fn: (...args: TArgs) => Promise<Result<TData, TError>>,
) {
	return async function (...args: TArgs) {
		const result = await fn(...args);

		if (result.status === "error") {
			throw result.error instanceof Error
				? result.error
				: new Error(String(result.error), { cause: result });
		}

		return result.data;
	};
}

function isValidDate(date: Date) {
	return !Number.isNaN(date.getTime());
}

function getSampledAt(result: unknown): Date | undefined {
	if (
		result &&
		typeof result === "object" &&
		"sampledAt" in result &&
		typeof result.sampledAt === "string"
	) {
		const date = new Date(result.sampledAt);

		return isValidDate(date) ? date : undefined;
	}

	return undefined;
}

function reconcileSampledAt<TData extends { sampledAt: string }>(
	current: TData | undefined,
	incoming: TData,
) {
	if (!current) return incoming;

	const currentDate = getSampledAt(current);
	const incomingDate = getSampledAt(incoming);

	if (!(currentDate && incomingDate)) return incoming;

	return incomingDate >= currentDate ? incoming : current;
}

export { handleResult, reconcileSampledAt };
export type { Result };
