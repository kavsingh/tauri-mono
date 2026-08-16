import { Effect } from "effect";

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

export { fromCommandResult, fromPromise };
export type { CommandResult };
