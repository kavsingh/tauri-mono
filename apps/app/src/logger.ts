import { createScopedLogger as createScoped } from "shared/logger";
import { createTauriLogger } from "shared/logger-tauri";

import type { Logger } from "shared/logger";

export const logger = createTauriLogger();

export function createScopedLogger(scope: string, baseLogger = logger): Logger {
	return createScoped(scope, baseLogger);
}
