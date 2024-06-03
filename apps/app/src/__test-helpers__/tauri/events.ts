import { events } from "#__generated__/bindings";

import type { SystemStats } from "#__generated__/bindings";
import type { Mock } from "vitest";

export function publishSystemStatsEvent(payload: SystemStats) {
	publishListenerEvent(events.systemStatsEvent.listen as Mock, payload);
}

function publishListenerEvent(listen: Mock, payload: unknown) {
	const calls: unknown[] = listen.mock.calls;

	for (const call of calls) {
		if (!Array.isArray(call)) continue;

		const maybeListener: unknown = call[0];

		if (typeof maybeListener === "function") maybeListener({ payload });
	}
}
