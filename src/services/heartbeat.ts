import { subscribeWindow } from "ui:bridge/subscribe";

import type { TauriEventHandler } from "ui:bridge/subscribe";

export { initHeartbeat } from "ui:__generated__/bindings/commands";

export function subscribeToHeartbeat(handler: TauriEventHandler<"heartbeat">) {
	return subscribeWindow("heartbeat", handler);
}
