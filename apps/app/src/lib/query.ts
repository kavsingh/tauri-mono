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

export { reconcileSampledAt };
