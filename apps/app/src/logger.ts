import { debug, info, warn, error } from "@tauri-apps/plugin-log";
import {
	createScopedLogger as baseCreateScopedLogger,
	formatUnknown,
} from "shared/logger";

import type { Logger } from "shared/logger";

function formatArgs(...args: unknown[]) {
	return args.map((item) => formatUnknown(item)).join(" ");
}

export const logger: Logger = {
	debug: (...args) => void debug(formatArgs(args)),
	info: (...args) => void info(formatArgs(args)),
	warn: (...args) => void warn(formatArgs(args)),
	error: (...args) => void error(formatArgs(args)),
};

export function createScopedLogger(scope: string, baseLogger = logger): Logger {
	return baseCreateScopedLogger(scope, baseLogger);
}
