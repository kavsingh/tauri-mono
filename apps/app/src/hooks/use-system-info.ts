import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { onCleanup } from "solid-js";

import { commands, events } from "#__generated__/bindings";

export default function useSystemInfo() {
	const queryClient = useQueryClient();
	const query = createQuery(() => ({
		queryKey: ["systemInfo"],
		queryFn: () => commands.getSystemInfo(),
	}));

	const unsubscribePromise = events.systemInfoEvent.listen((event) => {
		queryClient.setQueryData(["systemInfo"], () => event.payload);
	});

	onCleanup(() => {
		void unsubscribePromise.then((unsubscribe) => {
			unsubscribe();
		});
	});

	return query;
}
