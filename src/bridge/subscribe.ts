import { listen, once } from '@tauri-apps/api/event';

import type { EventCallback } from '@tauri-apps/api/event';

export const subscribe = <K extends keyof SubscribeMap>(
  eventName: K,
  handler: EventCallback<SubscribeMap[K]>,
): (() => void) => {
  const unlistenPromise = listen<SubscribeMap[K]>(eventName, handler);

  return () => {
    void unlistenPromise.then((unlisten) => {
      unlisten();
    });
  };
};

export const subscribeOnce = <K extends keyof SubscribeMap>(
  eventName: K,
  handler: EventCallback<SubscribeMap[K]>,
): (() => void) => {
  const unlistenPromise = once<SubscribeMap[K]>(eventName, handler);

  return () => {
    void unlistenPromise.then((unlisten) => {
      unlisten();
    });
  };
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SubscribeMap {}
