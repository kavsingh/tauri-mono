import { Effect, Exit } from "effect";
import { createContext, createSignal, useContext } from "solid-js";

import { reconcileSampledAt } from "~/lib/query";
import { systemStatsEffect } from "~/services/tauri";
import { events } from "~/tauri-bindings.gen";

import type { Accessor, ParentProps, Setter } from "solid-js";
import type { SystemStats } from "~/tauri-bindings.gen";

interface SystemStatsStore {
	stats: Accessor<SystemStats | undefined>;
	setStats: Setter<SystemStats | undefined>;
}

function createSystemStatsStore(): SystemStatsStore {
	const [stats, setStats] = createSignal<SystemStats>();

	return { stats, setStats };
}

async function startEventListeners(store: SystemStatsStore) {
	const initial = await Effect.runPromiseExit(systemStatsEffect());

	if (Exit.isSuccess(initial)) {
		store.setStats((current) => reconcileSampledAt(current, initial.value));
	}

	const unlisten = await events.systemStatsEvent.listen((event) => {
		store.setStats((current) => reconcileSampledAt(current, event.payload));
	});

	return unlisten;
}

const SystemStatsContext = createContext<SystemStatsStore>();

function SystemStatsProvider(props: ParentProps<{ store: SystemStatsStore }>) {
	return (
		// the store is a stable container of signals/setters, so the context
		// value does not need to be re-derived reactively.
		// oxlint-disable-next-line solid/reactivity
		<SystemStatsContext.Provider value={props.store}>
			{props.children}
		</SystemStatsContext.Provider>
	);
}

function useSystemStats(): Accessor<SystemStats | undefined> {
	const store = useContext(SystemStatsContext);

	if (!store) {
		// oxlint-disable-next-line eslint-js/no-restricted-syntax
		throw new Error("useSystemStats must be used within <SystemStatsProvider>");
	}

	return store.stats;
}

export {
	createSystemStatsStore,
	startEventListeners,
	SystemStatsProvider,
	useSystemStats,
};
export type { SystemStatsStore };
