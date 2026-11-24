import {
	mutationOptions,
	QueryClient,
	queryOptions,
} from "@tanstack/solid-query";
import { commands, events } from "shared/tauri-bindings.gen";

import { logError, reconcileSampledAt, retryIfTauriAllowed } from "~/lib/query";

import type {
	SystemStats_Serialize,
	ThemePreference,
} from "shared/tauri-bindings.gen";

const systemInfoQueryFn = logError("systemInfo", () =>
	commands.getSystemInfo(),
);
const systemStatsQueryFn = logError("systemStats", () =>
	commands.getSystemStats(),
);
const themePreferenceQueryFn = logError("themePreference", () =>
	commands.getThemePreference(),
);
const setThemePreferenceMutationFn = logError(
	"setThemePreference",
	(pref: ThemePreference) => commands.setThemePreference(pref),
);
const retry = retryIfTauriAllowed();

function systemInfoQuery() {
	return queryOptions({
		queryKey: ["systemInfo"],
		queryFn: systemInfoQueryFn,
		retry,
	});
}

function systemStatsQuery() {
	return queryOptions({
		queryKey: ["systemStats"],
		queryFn: systemStatsQueryFn,
		structuralSharing: reconcileSampledAt,
		retry,
	});
}

function themePreferenceQuery() {
	return queryOptions({
		queryKey: ["themePreference"],
		queryFn: themePreferenceQueryFn,
		retry,
	});
}

function setThemePreferenceMutation() {
	return mutationOptions({
		mutationFn: setThemePreferenceMutationFn,
		onSuccess: (_data, _vars: unknown, _result, ctx) => {
			void ctx.client.invalidateQueries({
				queryKey: themePreferenceQuery().queryKey,
			});
		},
	});
}

function startEventListeners(client: QueryClient) {
	const statsKey = systemStatsQuery().queryKey;

	const unsubStats = events.systemStatsEvent.listen((event) => {
		const current = client.getQueryData<SystemStats_Serialize>(statsKey);
		const next = reconcileSampledAt(current, event.payload);

		if (next !== current) {
			client.setQueryData<SystemStats_Serialize>(statsKey, () => next);
		}
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
