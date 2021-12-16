import { tauri } from '@tauri-apps/api';
import { listen, once } from '@tauri-apps/api/event';

import type { EventCallback } from '@tauri-apps/api/event';
import type { CustomCommandResponse } from './__generated__/custom-command-response';
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

export type { CustomEvent, CustomCommandResponse };

interface InvokeMap {
  my_custom_command: (args: { number: number }) => CustomCommandResponse;
}

interface SubscribeMap {
  'custom-event': CustomEvent;
}
