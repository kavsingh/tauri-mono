import { createQuery, useQueryClient } from "@tanstack/solid-query";

import { commands, events } from "#__generated__/bindings";

import type { SystemStats } from "#__generated__/bindings";
import type { QueryClient } from "@tanstack/solid-query";

export default function useSystemStats() {
	const queryClient = useQueryClient();
	const query = createQuery(() => ({
		queryKey,
		queryFn: () => commands.getSystemStats(),
		reconcile: (oldData, newData) => {
			return oldData && BigInt(oldData.sampledAt) >= BigInt(newData.sampledAt)
				? oldData
				: newData;
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
			const shouldUpdate = current
				? BigInt(event.payload.sampledAt) > BigInt(current.sampledAt)
				: true;

			if (shouldUpdate) {
				cachedClient.setQueryData(queryKey, () => event.payload);
			}
		});
	};
})();
