export interface Logger {
	debug: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
}

export function createScopedLogger(scope: string, baseLogger: Logger): Logger {
	const formattedScope = `[${scope}]`;

	return {
		debug: baseLogger.debug.bind(baseLogger, formattedScope),
		info: baseLogger.info.bind(baseLogger, formattedScope),
		warn: baseLogger.warn.bind(baseLogger, formattedScope),
		error: baseLogger.error.bind(baseLogger, formattedScope),
	};
}

export function formatUnknown(value: unknown): string {
	if (typeof value === "string") return value;

	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}
