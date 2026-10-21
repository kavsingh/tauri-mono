import {
	mutationOptions,
	QueryClient,
	queryOptions,
} from "@tanstack/solid-query";

import { handleResult, reconcileSampledAt } from "~/lib/query";
import { commands, events } from "~/tauri-bindings.gen";

import type { SystemStats_Serialize } from "~/tauri-bindings.gen";

function systemInfoQuery() {
	return queryOptions({
		queryKey: ["systemInfo"],
		queryFn: commands.getSystemInfo,
	});
}

function systemStatsQuery() {
	return queryOptions({
		queryKey: ["systemStats"],
		queryFn: handleResult(commands.getSystemStats),
		reconcile: reconcileSampledAt<SystemStats_Serialize>,
	});
}

function themePreferenceQuery() {
	return queryOptions({
		queryKey: ["themePreference"],
		queryFn: commands.getThemePreference,
	});
}

function setThemePreferenceMutation() {
	return mutationOptions({
		mutationFn: commands.setThemePreference,
		onSuccess: (_data, _vars, _result, ctx) => {
			void ctx.client.invalidateQueries({
				queryKey: themePreferenceQuery().queryKey,
			});
		},
	});
}

async function startEventListeners(client: QueryClient) {
	const statsKey = systemStatsQuery().queryKey;

	const unsubStats = await events.systemStatsEvent.listen((event) => {
		const current = client.getQueryData<SystemStats_Serialize>(statsKey);
		const next = reconcileSampledAt(current, event.payload);

		if (next !== current) client.setQueryData(statsKey, () => next);
	});

	return unsubStats;
}

export {
	systemInfoQuery,
	systemStatsQuery,
	themePreferenceQuery,
	setThemePreferenceMutation,
	startEventListeners,
};
