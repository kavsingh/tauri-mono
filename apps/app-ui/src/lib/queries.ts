// will need excessive typing unless we rely on inference from helpers
// oxlint-disable explicit-module-boundary-types

import { queryOptions } from "@tanstack/solid-query";
import { commands } from "shared/__generated__/tauri/bindings";

export function systemInfoQuery() {
	return queryOptions({
		queryKey: ["systemInfo"],
		queryFn: () => commands.getSystemInfo(),
	});
}

export function systemStatsQuery() {
	return queryOptions({ queryKey: ["systemStats"], queryFn: getSystemStats });
}

export function themePreferenceQuery() {
	return queryOptions({
		queryKey: ["themePreference"],
		queryFn: () => commands.getThemePreference(),
	});
}

async function getSystemStats() {
	const result = await commands.getSystemStats();

	if (result.status === "error") {
		throw new Error(result.error, { cause: result });
	}

	return result.data;
}
