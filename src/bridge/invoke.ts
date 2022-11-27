import { tauri } from "@tauri-apps/api";

import type { SysInfoResponse } from "./__generated__/sys-info-response";
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
	get_sys_info: () => SysInfoResponse;
}
