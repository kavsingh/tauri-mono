import { tauri } from '@tauri-apps/api';

import type { SelectFilesResponse } from '../__generated__/select-files-response';

export const invoker =
  <K extends keyof InvokeMap>(command: K) =>
  (
    args: NonNullable<Parameters<InvokeMap[K]>[0]> extends never
      ? void
      : keyof NonNullable<Parameters<InvokeMap[K]>[0]> extends never
      ? void
      : NonNullable<Parameters<InvokeMap[K]>[0]>,
  ): Promise<ReturnType<InvokeMap[K]>> =>
    tauri.invoke(command, args || {});

interface InvokeMap {
  select_files: () => SelectFilesResponse;
}
