import { createInvoker } from "ui:bridge/invoke";
import { subscribeWindow } from "ui:bridge/subscribe";

export const initHeartbeat = createInvoker("init_heartbeat");

export const subscribeToHeartBeat = subscribeWindow.bind(null, "heartbeat");
