import { logger } from "~/logger";

// oxlint-disable-next-line typescript/no-explicit-any
function logError<TResponse, TArgs extends any[]>(
	label: string,
	fn: (...args: TArgs) => Promise<TResponse>,
) {
	return async function (...args: TArgs) {
		try {
			return await fn(...args);
		} catch (cause) {
			logger.error(`[${label}] error:`, cause);
			// oxlint-disable-next-line eslint-js/no-restricted-syntax
			throw cause;
		}
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

function retryIfTauriAllowed(maxRetries = 3) {
	return function retry(failureCount: number, cause: unknown) {
		const message = String(cause);

		// @TODO: brittle
		return (
			failureCount < maxRetries &&
			!message.includes("not allowed. Plugin not found")
		);
	};
}

export { logError, reconcileSampledAt, retryIfTauriAllowed };
