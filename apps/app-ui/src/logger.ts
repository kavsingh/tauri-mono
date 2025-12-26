import { debug, info, warn, error } from "@tauri-apps/plugin-log";
import {
	createScopedLogger as baseCreateScopedLogger,
	formatUnknownArgs as format,
} from "shared/logger";

import type { Logger } from "shared/logger";

export const logger: Logger = {
	debug: (...args) => void debug(format(args)),
	info: (...args) => void info(format(args)),
	warn: (...args) => void warn(format(args)),
	error: (...args) => void error(format(args)),
};

export function createScopedLogger(scope: string, baseLogger = logger): Logger {
	return baseCreateScopedLogger(scope, baseLogger);
}
