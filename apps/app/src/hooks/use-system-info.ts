import { createQuery } from "@tanstack/solid-query";

import { getSystemInfo } from "#__generated__/bindings/commands";

import type { SystemInfoResponse } from "#__generated__/bindings/commands";

export default function useSystemInfo() {
	// const queryClient = useQueryClient();

	const query = createQuery<SystemInfoResponse>(() => ({
		queryKey: ["systemInfo"],
		queryFn: getSystemInfo,
	}));

	// const subscription = client.systemInfoEvent.subscribe(undefined, {
	// 	onData(data) {
	// 		queryClient.setQueryData(["systemInfo"], () => data);
	// 	},
	// });

	// onCleanup(() => {
	// 	subscription.unsubscribe();
	// });

	return query;
}
