import { fromCommandResult, fromPromise } from "~/lib/effect";
import { commands } from "~/tauri-bindings.gen";

import type { ThemePreference } from "~/tauri-bindings.gen";

function systemInfoEffect() {
	return fromPromise(commands.getSystemInfo());
}

function systemStatsEffect() {
	return fromCommandResult(commands.getSystemStats());
}

function themePreferenceEffect() {
	return fromPromise(commands.getThemePreference());
}

function setThemePreferenceEffect(preference: ThemePreference) {
	return fromPromise(commands.setThemePreference(preference));
}

export {
	setThemePreferenceEffect,
	systemInfoEffect,
	systemStatsEffect,
	themePreferenceEffect,
};
