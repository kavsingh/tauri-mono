import { useQuery, useQueryClient } from "@tanstack/solid-query";

import { events } from "#__generated__/bindings";
import { systemStatsQuery } from "#lib/queries";

import type { SystemStats } from "#__generated__/bindings";
import type { QueryClient, UseQueryResult } from "@tanstack/solid-query";

export function useSystemStats(): UseQueryResult<SystemStats> {
	const queryClient = useQueryClient();
	const query = useQuery(() => ({ ...systemStatsQuery(), reconcile }));

	void startSubscription(queryClient);

	return query;
}

const startSubscription = (() => {
	const queryKey = systemStatsQuery().queryKey;
	let cachedClient: QueryClient | undefined = undefined;
	let unlisten:
		| Awaited<ReturnType<typeof events.systemStatsEvent.listen>>
		| undefined = undefined;

	return async function start(queryClient: QueryClient) {
		if (cachedClient === queryClient) return;

		unlisten?.();
		cachedClient = queryClient;

		unlisten = await events.systemStatsEvent.listen((event) => {
			if (!cachedClient) return;

			const current = cachedClient.getQueryData<SystemStats>(queryKey);
			const next = reconcile(current, event.payload);

			if (next !== current) {
				cachedClient.setQueryData(queryKey, () => next);
			}
		});
	};
})();

function reconcile(current: SystemStats | undefined, incoming: SystemStats) {
	if (!current) {
		return incoming;
	}

	const currentDate = new Date(current.sampledAt);
	const incomingDate = new Date(incoming.sampledAt);

	if (!(isValidDate(currentDate) && isValidDate(incomingDate))) {
		return incoming;
	}

	return incomingDate >= currentDate ? incoming : current;
}

function isValidDate(date: Date) {
	return !Number.isNaN(date.getTime());
}
