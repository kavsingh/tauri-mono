import { invoker } from "~/bridge/invoke";
import { subscribeWindow } from "~/bridge/subscribe";

export const initHeartbeat = invoker("init_heartbeat");

export const subscribeToHeartBeat = subscribeWindow.bind(null, "heartbeat");
