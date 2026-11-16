import { useMutation, useQuery } from "@tanstack/solid-query";
import { Show } from "solid-js";

import { Button } from "~/components/button";
import { connectRemoteMutation, connectionStatusQuery } from "~/services/tauri";

import type { JSX } from "@solidjs/web";

function ConnectionBanner(): JSX.Element {
	const statusQuery = useQuery(connectionStatusQuery);
	const retryMutation = useMutation(() => ({
		...connectRemoteMutation(),
		onSuccess: () => void statusQuery.refetch(),
	}));

	return (
		<>
			<Show when={statusQuery.error}>
				<output
					class="border-be border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
					aria-live="polite"
				>
					Could not determine connection mode: {String(statusQuery.error)}
				</output>
			</Show>
			{/* oxlint-disable-next-line typescript/no-unnecessary-condition */}
			<Show when={statusQuery.data?.mode === "local"}>
				<output
					class="flex items-center justify-between gap-4 border-be border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm"
					aria-live="polite"
				>
					<span class="block">
						<span class="block font-medium">
							Using a local copy. It may be out of date.
						</span>
						{/* oxlint-disable-next-line typescript/no-unnecessary-condition */}
						<Show when={retryMutation.error ?? statusQuery.data?.error}>
							<span class="mbs-1 block text-muted-foreground">
								{String(retryMutation.error ?? statusQuery.data.error)}
							</span>
						</Show>
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={retryMutation.isPending}
						onClick={() => void retryMutation.mutate()}
					>
						{retryMutation.isPending ? "Retrying..." : "Retry remote"}
					</Button>
				</output>
			</Show>
		</>
	);
}

export { ConnectionBanner };
