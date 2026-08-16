import { Effect } from "effect";

import { fromCommandResult, fromPromise } from "~/lib/effect";
import { commands, events } from "~/tauri-bindings.gen";

import type {
	SystemInfo,
	SystemStats,
	ThemePreference,
} from "~/tauri-bindings.gen";

interface TauriServiceShape {
	getSystemInfo: () => Effect.Effect<SystemInfo, unknown>;
	getSystemStats: () => Effect.Effect<SystemStats, unknown>;
	getThemePreference: () => Effect.Effect<ThemePreference, unknown>;
	setThemePreference: (
		preference: ThemePreference,
	) => Effect.Effect<void, unknown>;
	subscribeSystemStats: (
		onValue: (stats: SystemStats) => void,
	) => Effect.Effect<() => void, unknown>;
}

class TauriService extends Effect.Service<TauriService>()("TauriService", {
	sync: (): TauriServiceShape => ({
		getSystemInfo: (): Effect.Effect<SystemInfo, unknown> =>
			fromPromise(commands.getSystemInfo()),
		getSystemStats: (): Effect.Effect<SystemStats, unknown> =>
			fromCommandResult(commands.getSystemStats()),
		getThemePreference: (): Effect.Effect<ThemePreference, unknown> =>
			fromPromise(commands.getThemePreference()),
		setThemePreference: (
			preference: ThemePreference,
		): Effect.Effect<void, unknown> =>
			fromPromise(commands.setThemePreference(preference)),
		subscribeSystemStats: (
			onValue: (stats: SystemStats) => void,
		): Effect.Effect<() => void, unknown> =>
			fromPromise(
				events.systemStatsEvent.listen((event) => {
					onValue(event.payload);
				}),
			),
	}),
}) {}

const TauriLive = TauriService.Default;

const AppRuntime = TauriLive;

const runTauri = <T>(
	f: (service: TauriServiceShape) => Effect.Effect<T, unknown>,
) => TauriService.use((service) => f(service)).pipe(Effect.provide(AppRuntime));

function systemInfoEffect() {
	return runTauri((service) => service.getSystemInfo());
}

function systemStatsEffect() {
	return runTauri((service) => service.getSystemStats());
}

function themePreferenceEffect() {
	return runTauri((service) => service.getThemePreference());
}

function setThemePreferenceEffect(preference: ThemePreference) {
	return runTauri((service) => service.setThemePreference(preference));
}

export {
	TauriService,
	runTauri,
	setThemePreferenceEffect,
	systemInfoEffect,
	systemStatsEffect,
	themePreferenceEffect,
};
