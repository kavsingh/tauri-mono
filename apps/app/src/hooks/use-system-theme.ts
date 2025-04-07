import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";

import { getSystemTheme, setSystemTheme } from "#services/system-theme";

export default function useSystemTheme() {
	const queryClient = useQueryClient();
	const query = useQuery(() => ({
		queryKey: ["systemTheme"],
		queryFn: getSystemTheme,
	}));
	const mutation = useMutation(() => ({
		mutationFn: setSystemTheme,
		onSuccess() {
			void queryClient.invalidateQueries(query);
		},
	}));

	return [query, mutation] as const;
}
