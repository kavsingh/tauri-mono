import { createMemo, For } from "solid-js";

function Errors(errors: unknown[]) {
	const messages = createMemo(() => {
		const msgs: string[] = [];

		// oxlint-disable-next-line typescript/no-base-to-string
		for (const error of errors) if (error) msgs.push(String(error));

		return msgs;
	});

	return (
		<For each={messages()}>
			{(message) => (
				<div class="rounded-xs bg-destructive p-2 text-destructive-foreground">
					{message}
				</div>
			)}
		</For>
	);
}

export { Errors };
