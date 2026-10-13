import { createScopedLogger as createScoped } from "shared/logger";
import { createTauriLogger } from "shared/logger-tauri";

import type { Logger } from "shared/logger";

const logger = createTauriLogger();

function createScopedLogger(scope: string, baseLogger = logger): Logger {
	return createScoped(scope, baseLogger);
}

export { logger, createScopedLogger };
