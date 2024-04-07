import {
	createMutation,
	createQuery,
	useQueryClient,
} from "@tanstack/solid-query";

import { getSystemTheme, setSystemTheme } from "#services/theme";

export default function useSystemTheme() {
	const queryClient = useQueryClient();
	const query = createQuery(() => ({
		queryKey: ["systemTheme"],
		queryFn: getSystemTheme,
	}));
	const mutation = createMutation(() => ({
		mutationFn: setSystemTheme,
		onSuccess() {
			void queryClient.invalidateQueries(query);
		},
	}));

	return [query, mutation] as const;
}
