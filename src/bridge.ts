import { tauri } from '@tauri-apps/api';
import { listen, once } from '@tauri-apps/api/event';

import type { EventCallback } from '@tauri-apps/api/event';
import type { SelectFilesResponse } from './__generated__/select-files-response';

export const invoker =
  <K extends keyof InvokeMap>(command: K) =>
  (
    args: Parameters<InvokeMap[K]>[0] extends never
      ? void
      : keyof Parameters<InvokeMap[K]>[0] extends never
      ? void
      : Parameters<InvokeMap[K]>[0],
  ): Promise<ReturnType<InvokeMap[K]>> =>
    tauri.invoke(command, args || {});

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

export type { SelectFilesResponse };

interface InvokeMap {
  select_files: () => SelectFilesResponse;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SubscribeMap {}
