import { createQuery, useQueryClient } from "@tanstack/solid-query";

import { commands, events } from "#__generated__/bindings";

import type { SystemInfo } from "#__generated__/bindings";
import type { QueryClient } from "@tanstack/solid-query";

export default function useSystemInfo() {
	const queryClient = useQueryClient();
	const query = createQuery(() => ({
		queryKey,
		queryFn: () => commands.getSystemInfo(),
		reconcile: (oldData, newData) => {
			return oldData && BigInt(oldData.sampledAt) >= BigInt(newData.sampledAt)
				? oldData
				: newData;
		},
	}));

	void startSubscription(queryClient);

	return query;
}

const queryKey = ["systemInfo"];

const startSubscription = (() => {
	let cachedClient: QueryClient;
	let unlisten:
		| Awaited<ReturnType<typeof events.systemInfoEvent.listen>>
		| undefined = undefined;

	return async function start(queryClient: QueryClient) {
		if (cachedClient === queryClient) return;

		unlisten?.();
		cachedClient = queryClient;

		unlisten = await events.systemInfoEvent.listen((event) => {
			const current = cachedClient.getQueryData<SystemInfo>(queryKey);
			const shouldUpdate = current
				? BigInt(event.payload.sampledAt) > BigInt(current.sampledAt)
				: true;

			if (shouldUpdate) {
				cachedClient.setQueryData(queryKey, () => event.payload);
			}
		});
	};
})();
