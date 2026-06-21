import {
	mutationOptions,
	QueryClient,
	queryOptions,
} from "@tanstack/solid-query";

import { commands, events } from "~/__generated__/bindings";
import { handleResult, reconcileSampledAt } from "~/lib/query";

import type { SystemStats } from "~/__generated__/bindings";

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
		reconcile: reconcileSampledAt<SystemStats>,
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

function startEventListeners(client: QueryClient) {
	const statsKey = systemStatsQuery().queryKey;

	void events.systemStatsEvent.listen((event) => {
		const current = client.getQueryData<SystemStats>(statsKey);
		const next = reconcileSampledAt(current, event.payload);

		if (next !== current) client.setQueryData(statsKey, () => next);
	});
}

export {
	systemInfoQuery,
	systemStatsQuery,
	themePreferenceQuery,
	setThemePreferenceMutation,
	startEventListeners,
};
