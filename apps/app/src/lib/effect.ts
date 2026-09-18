import { Duration, Effect } from "effect";

type CommandResult<TData, TError> =
	| { status: "ok"; data: TData }
	| { status: "error"; error: TError };

function fromPromise<TData>(
	promise: Promise<TData>,
): Effect.Effect<TData, unknown> {
	return Effect.tryPromise({ try: () => promise, catch: (cause) => cause });
}

function fromCommandResult<TData, TError>(
	promise: Promise<CommandResult<TData, TError>>,
): Effect.Effect<TData, unknown> {
	return fromPromise(promise).pipe(
		Effect.flatMap((result) => {
			return result.status === "ok"
				? Effect.succeed(result.data)
				: Effect.fail(result.error);
		}),
	);
}

function cachedQuery<A, E, R>(
	load: () => Effect.Effect<A, E, R>,
	ttl: Duration.DurationInput = "1 hour",
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

export { cachedQuery, fromCommandResult, fromPromise };
export type { CommandResult };
