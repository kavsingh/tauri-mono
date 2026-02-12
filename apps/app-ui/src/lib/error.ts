export function tryOr<TReturn>(fn: () => TReturn, fallback: TReturn): TReturn {
	try {
		return fn();
	} catch {
		return fallback;
	}
}
