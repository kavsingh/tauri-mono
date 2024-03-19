import { subscribeWindow } from "#bridge/subscribe";

import type { TauriEventHandler } from "#bridge/subscribe";

export { initHeartbeat } from "#__generated__/bindings/commands";

export function subscribeToHeartbeat(handler: TauriEventHandler<"heartbeat">) {
	return subscribeWindow("heartbeat", handler);
}
