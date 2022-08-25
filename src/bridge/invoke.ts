import { tauri } from "@tauri-apps/api";

import type { SelectFilesResponse } from "../__generated__/select-files-response";
import type { InvokeArgs } from "@tauri-apps/api/tauri";

export const invoker =
	<K extends keyof InvokeMap>(command: K) =>
	(
		...args: keyof Parameters<InvokeMap[K]>[0] extends never
			? []
			: [Parameters<InvokeMap[K]>[0]]
	): Promise<ReturnType<InvokeMap[K]>> =>
		tauri.invoke(command, args[0] as unknown as InvokeArgs);

interface InvokeMap {
	select_files: () => SelectFilesResponse;
}
