import { Cause, Effect, Exit } from "effect";
import { createSignal } from "solid-js";

import type { Accessor } from "solid-js";

interface MutationState<TData> {
	status: "idle" | "pending" | "success" | "error";
	data?: TData;
	error?: unknown;
}

function useEffectMutation<TArgs extends unknown[], TData, TError>(
	createMutationEffect: (...args: TArgs) => Effect.Effect<TData, TError>,
): [Accessor<MutationState<TData>>, (...args: TArgs) => Promise<void>] {
	const [state, setState] = createSignal<MutationState<TData>>({
		status: "idle",
	});

	async function mutate(...args: TArgs) {
		setState({ status: "pending" });

		const exit = await Effect.runPromiseExit(createMutationEffect(...args));

		setState(
			Exit.isSuccess(exit)
				? { status: "success", data: exit.value }
				: { status: "error", error: Cause.squash(exit.cause) },
		);
	}

	return [state, mutate];
}

export { useEffectMutation };
export type { MutationState };
