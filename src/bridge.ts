import { tauri } from '@tauri-apps/api';
import { listen, once } from '@tauri-apps/api/event';

import type { EventCallback } from '@tauri-apps/api/event';
import type { LoadFilesResponse } from './__generated__/load-files-response';
import type { CustomEvent } from './__generated__/custom-event';

export const invoke = <K extends keyof InvokeMap>(
  command: K,
  args: Parameters<InvokeMap[K]>[0],
): Promise<ReturnType<InvokeMap[K]>> => tauri.invoke(command, args || {});

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

export type { CustomEvent, LoadFilesResponse };

interface InvokeMap {
  load_files: (args: { maybe_initial_path: string }) => LoadFilesResponse;
}

interface SubscribeMap {
  'custom-event': CustomEvent;
}
