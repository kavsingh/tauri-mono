import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { onCleanup } from "solid-js";

import { getSystemInfo } from "#__generated__/bindings/commands";
import { subscribeGlobal } from "#bridge/subscribe";

export default function useSystemInfo() {
	const queryClient = useQueryClient();
	const query = createQuery(() => ({
		queryKey: ["systemInfo"],
		queryFn: getSystemInfo,
	}));

	const unsubscribe = subscribeGlobal("system-info-event", (event) => {
		queryClient.setQueryData(["systemInfo"], () => event.payload);
	});

	onCleanup(() => {
		void unsubscribe();
	});

	return query;
}
