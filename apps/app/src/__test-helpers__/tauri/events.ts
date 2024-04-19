import { events } from "#__generated__/bindings";

import type { SystemInfo } from "#__generated__/bindings";
import type { Mock } from "vitest";

export function publishSystemInfoEvent(payload: SystemInfo) {
	const calls: unknown[] = (events.systemInfoEvent.listen as Mock).mock.calls;

	for (const call of calls) {
		if (!Array.isArray(call)) continue;

		const maybeListener: unknown = call[0];

		if (typeof maybeListener === "function") maybeListener({ payload });
	}
}
