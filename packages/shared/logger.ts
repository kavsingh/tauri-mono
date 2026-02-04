export interface Logger {
	trace: (...args: unknown[]) => void;
	debug: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
}

export function createScopedLogger(scope: string, baseLogger: Logger): Logger {
	const formattedScope = `[${scope}]`;

	return {
		trace: baseLogger.trace.bind(baseLogger, formattedScope),
		debug: baseLogger.debug.bind(baseLogger, formattedScope),
		info: baseLogger.info.bind(baseLogger, formattedScope),
		warn: baseLogger.warn.bind(baseLogger, formattedScope),
		error: baseLogger.error.bind(baseLogger, formattedScope),
	};
}

export function formatUnknownArgs(...args: unknown[]): string {
	return args.map((item) => formatUnknown(item)).join(" ");
}

function formatUnknown(value: unknown): string {
	if (typeof value === "string") return value;

	try {
		return JSON.stringify(value, unknownValReplacer);
	} catch {
		return String(value);
	}
}

function unknownValReplacer(_: string, val: unknown) {
	switch (typeof val) {
		case "bigint": {
			return `${val.toString()}n`;
		}

		case "function": {
			return `Function(${val.name ?? "anonymous"})`;
		}

		case "symbol": {
			return val.toString();
		}

		default: {
			return val;
		}
	}
}
