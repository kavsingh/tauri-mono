import { Context, Effect } from "effect";

import { cachedQuery, fromCommandResult, fromPromise } from "~/lib/effect";
import { commands, events } from "~/tauri-bindings.gen";

import type { SystemStats, ThemePreference } from "~/tauri-bindings.gen";

const tauriService = {
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

type TauriServiceShape = typeof tauriService;

class TauriService extends Context.Service<TauriService, TauriServiceShape>()(
	"TauriService",
) {}

function runTauri<T>(
	f: (service: TauriServiceShape) => Effect.Effect<T, unknown>,
) {
	return TauriService.use((service) => f(service)).pipe(
		Effect.provideService(TauriService, tauriService),
	);
}

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
