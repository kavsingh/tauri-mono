import {
	mutationOptions,
	QueryClient,
	queryOptions,
} from "@tanstack/solid-query";
import { openUrl } from "@tauri-apps/plugin-opener";
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
const connectionStatusQueryFn = logError("connectionStatus", () =>
	commands.getConnectionStatus(),
);
const setThemePreferenceMutationFn = logError(
	"setThemePreference",
	(pref: ThemePreference) => commands.setThemePreference(pref),
);
const openExternalUrlMutationFn = logError("openExternalUrl", (url: string) =>
	openUrl(url),
);
const openUserDirMutationFn = logError("openUserDir", () =>
	commands.openUserDir(),
);
const connectRemoteMutationFn = logError("connectRemote", () =>
	commands.connectRemote(),
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

function connectionStatusQuery() {
	return queryOptions({
		queryKey: ["connectionStatus"],
		queryFn: connectionStatusQueryFn,
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

function openExternalUrlMutation() {
	return mutationOptions({ mutationFn: openExternalUrlMutationFn });
}

function openUserDirMutation() {
	return mutationOptions({ mutationFn: openUserDirMutationFn });
}

function connectRemoteMutation() {
	return mutationOptions({ mutationFn: connectRemoteMutationFn });
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
	connectionStatusQuery,
	setThemePreferenceMutation,
	openExternalUrlMutation,
	openUserDirMutation,
	connectRemoteMutation,
	startEventListeners,
};
