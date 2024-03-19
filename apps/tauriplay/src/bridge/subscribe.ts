import { listen } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";

import type { HeartbeatEvent } from "#__generated__/bindings/heartbeat-event";
import type { EventCallback } from "@tauri-apps/api/event";

export function subscribeGlobal<K extends keyof SubscribeMap>(
	eventName: K,
	handler: TauriEventHandler<K>,
): () => Promise<void> {
	const unlistenPromise = listen<SubscribeMap[K]>(eventName, handler);

	return async function unsubscribe() {
		return unlistenPromise.then((unlisten) => {
			unlisten();
		});
	};
}

export function subscribeWindow<K extends keyof SubscribeMap>(
	eventName: K,
	handler: TauriEventHandler<K>,
): () => Promise<void> {
	const unlistenPromise = appWindow.listen<SubscribeMap[K]>(eventName, handler);

	return async function unsubscribe() {
		return unlistenPromise.then((unlisten) => {
			unlisten();
		});
	};
}

export type TauriEventHandler<K extends keyof SubscribeMap> = EventCallback<
	SubscribeMap[K]
>;

type SubscribeMap = {
	heartbeat: HeartbeatEvent;
};
