import { Effect } from "effect";

import { cachedQuery, fromCommandResult, fromPromise } from "~/lib/effect";
import { commands, events } from "~/tauri-bindings.gen";

import type { SystemStats, ThemePreference } from "~/tauri-bindings.gen";

class TauriService extends Effect.Service<TauriService>()("TauriService", {
	sync: () => {
		return {
			getSystemInfo: () => fromPromise(commands.getSystemInfo()),
			getSystemStats: () => fromCommandResult(commands.getSystemStats()),
			getThemePreference: () => fromPromise(commands.getThemePreference()),
			setThemePreference: (preference: ThemePreference) => {
				return fromPromise(commands.setThemePreference(preference));
			},
			subscribeSystemStats: (onValue: (stats: SystemStats) => void) => {
				return fromPromise(
					events.systemStatsEvent.listen((event) => {
						onValue(event.payload);
					}),
				);
			},
		};
	},
}) {}

const TauriLive = TauriService.Default;

const AppRuntime = TauriLive;

const runTauri = <T>(f: (service: TauriService) => Effect.Effect<T, unknown>) =>
	TauriService.use((service) => f(service)).pipe(Effect.provide(AppRuntime));

const themePreferenceCache = cachedQuery(
	() => runTauri((service) => service.getThemePreference()),
	"1 hour",
);

function systemInfoEffect() {
	return Effect.cached(runTauri((service) => service.getSystemInfo())).pipe(
		Effect.flatten,
	);
}

function systemStatsEffect() {
	return Effect.cached(runTauri((service) => service.getSystemStats())).pipe(
		Effect.flatten,
	);
}

function themePreferenceEffect() {
	return themePreferenceCache.read();
}

function setThemePreferenceEffect(preference: ThemePreference) {
	return Effect.gen(function* () {
		yield* runTauri((service) => service.setThemePreference(preference));
		yield* themePreferenceCache.refresh();
	});
}

export {
	TauriService,
	runTauri,
	setThemePreferenceEffect,
	systemInfoEffect,
	systemStatsEffect,
	themePreferenceEffect,
};
