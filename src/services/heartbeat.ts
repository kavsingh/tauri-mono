import { createInvoker } from "ui:bridge/invoke";
import { subscribeWindow } from "ui:bridge/subscribe";

import type { TauriEventHandler } from "ui:bridge/subscribe";

export const initHeartbeat = createInvoker("init_heartbeat");

export function subscribeToHeartbeat(handler: TauriEventHandler<"heartbeat">) {
	return subscribeWindow("heartbeat", handler);
}
