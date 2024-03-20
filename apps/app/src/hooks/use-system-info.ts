import { createQuery } from "@tanstack/solid-query";

import type { SysInfoResponse } from "#__generated__/bindings/commands";

export { getSysInfo } from "#__generated__/bindings/commands";

export default function useSystemInfo() {
	// const queryClient = useQueryClient();

	const query = createQuery<SysInfoResponse>(() => ({
		queryKey: ["systemInfo"],
		// queryFn: () => getSysInfo(),
		queryFn: () => {
			return Promise.resolve({
				name: "name",
				osVersion: "version",
				hostName: "host",
			});
		},
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
