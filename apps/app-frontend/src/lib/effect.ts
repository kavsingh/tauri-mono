import { Duration, Effect } from "effect";

function fromPromise<TData>(
	promise: Promise<TData>,
): Effect.Effect<TData, unknown> {
	return Effect.tryPromise({ try: () => promise, catch: (cause) => cause });
}

function cachedQuery<A, E, R>(
	load: () => Effect.Effect<A, E, R>,
	ttl: Duration.Input = "1 hour",
) {
	let current:
		| { value: Effect.Effect<A, E, R>; invalidate: () => Effect.Effect<void> }
		| undefined;

	return {
		read: () =>
			Effect.gen(function* () {
				if (!current) {
					const [value, invalidate] = yield* Effect.cachedInvalidateWithTTL(
						load(),
						ttl,
					);

					current = { value, invalidate: () => invalidate };
				}

				return yield* current.value;
			}),
		refresh: () =>
			Effect.gen(function* () {
				if (current) {
					yield* current.invalidate();
				}

				current = undefined;
				return yield* cachedQuery(load, ttl).read();
			}),
	};
}

export { cachedQuery, fromPromise };
