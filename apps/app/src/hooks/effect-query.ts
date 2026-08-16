import { Cause, Effect, Exit } from "effect";
import { createResource } from "solid-js";

import type { Resource, ResourceActions } from "solid-js";

async function runEffect<TData, TError>(
	effect: Effect.Effect<TData, TError>,
): Promise<TData> {
	const exit = await Effect.runPromiseExit(effect);

	if (Exit.isSuccess(exit)) return exit.value;

	// createResource surfaces failures by throwing from the fetcher, so we
	// squash the cause back into a throwable.
	// oxlint-disable-next-line eslint-js/no-restricted-syntax
	throw Cause.squash(exit.cause);
}

function useEffectQuery<TData, TError>(
	createQueryEffect: () => Effect.Effect<TData, TError>,
): [Resource<TData>, ResourceActions<TData | undefined>] {
	return createResource(() => runEffect(createQueryEffect()));
}

export { runEffect, useEffectQuery };
