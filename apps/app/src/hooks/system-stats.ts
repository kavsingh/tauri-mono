import { useQuery, useQueryClient } from "@tanstack/solid-query";

import { commands, events } from "#__generated__/bindings";

import type { SystemStats } from "#__generated__/bindings";
import type { QueryClient } from "@tanstack/solid-query";

export function useSystemStats() {
	const queryClient = useQueryClient();
	const query = useQuery(() => ({
		queryKey,
		reconcile,
		async queryFn() {
			const result = await commands.getSystemStats();

			return result.status === "ok"
				? result.data
				: Promise.reject(new Error(result.error));
		},
	}));

	void startSubscription(queryClient);

	return query;
}

const queryKey = ["systemStats"];

const startSubscription = (() => {
	let cachedClient: QueryClient;
	let unlisten:
		| Awaited<ReturnType<typeof events.systemStatsEvent.listen>>
		| undefined = undefined;

	return async function start(queryClient: QueryClient) {
		if (cachedClient === queryClient) return;

		unlisten?.();
		cachedClient = queryClient;

		unlisten = await events.systemStatsEvent.listen((event) => {
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
