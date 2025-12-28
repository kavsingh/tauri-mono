export function tryOr<TReturn>(fn: () => TReturn, fallback: TReturn): TReturn {
	try {
		return fn();
	} catch {
		return fallback;
	}
}

export async function awaitOrElse<TReturn, TFallback>(
	promise: PromiseLike<TReturn>,
	orElse: (cause: unknown) => TFallback,
): Promise<TReturn | TFallback> {
	try {
		return await promise;
	} catch (cause) {
		return orElse(cause);
	}
}
