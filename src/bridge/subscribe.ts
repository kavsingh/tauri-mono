import { listen, once } from "@tauri-apps/api/event";

import type { EventCallback } from "@tauri-apps/api/event";

export function subscribe<K extends keyof SubscribeMap>(
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

export function subscribeOnce<K extends keyof SubscribeMap>(
	eventName: K,
	handler: EventCallback<SubscribeMap[K]>
): () => void {
	const unlistenPromise = once<SubscribeMap[K]>(eventName, handler);

	return function unsubscribe() {
		void unlistenPromise.then((unlisten) => {
			unlisten();
		});
	};
}

type SubscribeMap = Record<never, never>;
