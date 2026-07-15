import {
	mutationOptions,
	QueryClient,
	queryOptions,
} from "@tanstack/solid-query";
import { openUrl } from "@tauri-apps/plugin-opener";
import { commands, events } from "shared/__generated__/tauri/bindings";

import {
	logError,
	handleResult,
	reconcileSampledAt,
	retryIfTauriAllowed,
} from "~/lib/query";

import type { SystemStats } from "shared/__generated__/tauri/bindings";

const systemInfoQueryFn = logError("systemInfo", commands.getSystemInfo);
const systemStatsQueryFn = logError(
	"systemStats",
	handleResult(commands.getSystemStats),
);
const themePreferenceQueryFn = logError(
	"themePreference",
	commands.getThemePreference,
);
const setThemePreferenceMutationFn = logError(
	"setThemePreference",
	commands.setThemePreference,
);
const openExternalUrlMutationFn = logError("openExternalUrl", (url: string) =>
	openUrl(url),
);
const openUserDirMutationFn = logError("openUserDir", commands.openUserDir);
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
		reconcile: reconcileSampledAt<SystemStats>,
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

function openExternalUrlMutation() {
	return mutationOptions({ mutationFn: openExternalUrlMutationFn });
}

function openUserDirMutation() {
	return mutationOptions({ mutationFn: openUserDirMutationFn });
}

function startEventListeners(client: QueryClient) {
	const statsKey = systemStatsQuery().queryKey;

	const unsubStats = events.systemStatsEvent.listen((event) => {
		const current = client.getQueryData<SystemStats>(statsKey);
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
	openExternalUrlMutation,
	openUserDirMutation,
	startEventListeners,
};
