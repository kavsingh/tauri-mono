import { tauri } from "@tauri-apps/api";

import type { InvokeArgs } from "@tauri-apps/api/tauri";
import type { SysInfoResponse } from "tauri:bindings/sys-info-response";

export function createInvoker<K extends keyof InvokeMap>(command: K) {
	return function invoke(
		...args: keyof Parameters<InvokeMap[K]>[0] extends never
			? []
			: [Parameters<InvokeMap[K]>[0]]
	): Promise<ReturnType<InvokeMap[K]>> {
		return tauri.invoke(command, args[0] as unknown as InvokeArgs);
	};
}

type InvokeMap = {
	get_sys_info: () => SysInfoResponse;
	init_heartbeat: () => void;
};
