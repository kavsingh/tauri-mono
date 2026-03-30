import { vi } from "vitest";

import { events } from "~/__generated__/bindings";

import type { Mock } from "vitest";
import type { SystemStats } from "~/__generated__/bindings";

function publishListenerEvent(listen: Mock, payload: unknown) {
	const calls: unknown[] = listen.mock.calls;

	for (const call of calls) {
		if (!Array.isArray(call)) continue;

		const maybeListener: unknown = call[0];

		// oxlint-disable-next-line typescript/no-unsafe-call
		if (typeof maybeListener === "function") maybeListener({ payload });
	}
}

export function publishSystemStatsEvent(payload: SystemStats): void {
	publishListenerEvent(vi.mocked(events.systemStatsEvent.listen), payload);
}
