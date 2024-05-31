import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { onCleanup } from "solid-js";

import { commands, events } from "#__generated__/bindings";

const queryKey = ["systemInfo"];

export default function useSystemInfo() {
	const queryClient = useQueryClient();
	const query = createQuery(() => ({
		queryKey,
		queryFn: () => commands.getSystemInfo(),
	}));

	const unsubscribePromise = events.systemInfoEvent.listen((event) => {
		const current =
			queryClient.getQueryData<
				Awaited<ReturnType<typeof commands.getSystemInfo>>
			>(queryKey);

		const shouldUpdate = current
			? event.payload.sampledAt >= current.sampledAt
			: true;

		if (shouldUpdate) queryClient.setQueryData(queryKey, () => event.payload);
	});

	onCleanup(() => {
		void unsubscribePromise.then((unsubscribe) => {
			unsubscribe();
		});
	});

	return query;
}
