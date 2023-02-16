import { listen } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";

import type { HeartbeatEvent } from "./__generated__/heartbeat-event";
import type { EventCallback } from "@tauri-apps/api/event";

export function subscribeGlobal<K extends keyof SubscribeMap>(
	eventName: K,
	handler: EventCallback<SubscribeMap[K]>
): () => void {
	const unlistenPromise = listen<SubscribeMap[K]>(eventName, handler);

	return function unsubscribe() {
		void unlistenPromise.then((unlisten) => {
			unlisten();
		});
	};
}

export function subscribeWindow<K extends keyof SubscribeMap>(
	eventName: K,
	handler: EventCallback<SubscribeMap[K]>
): () => void {
	const unlistenPromise = appWindow.listen<SubscribeMap[K]>(eventName, handler);

	return function unsubscribe() {
		void unlistenPromise.then((unlisten) => {
			unlisten();
		});
	};
}

type SubscribeMap = {
	heartbeat: HeartbeatEvent;
};
