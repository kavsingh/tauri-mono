import { debug, info, warn, error, trace } from "@tauri-apps/plugin-log";

import { formatUnknownArgs } from "./logger.ts";

import type { Logger } from "./logger.ts";

export function createTauriLogger(): Logger {
	return {
		trace: (...args) => void trace(formatUnknownArgs(...args)),
		debug: (...args) => void debug(formatUnknownArgs(...args)),
		info: (...args) => void info(formatUnknownArgs(...args)),
		warn: (...args) => void warn(formatUnknownArgs(...args)),
		error: (...args) => void error(formatUnknownArgs(...args)),
	};
}
