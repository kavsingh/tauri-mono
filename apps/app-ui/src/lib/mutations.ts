import { openUrl } from "@tauri-apps/plugin-opener";
import { commands } from "shared/__generated__/tauri/bindings";

import type { MutationOptions } from "@tanstack/solid-query";

export function openExternalUrlMutation(): MutationOptions<
	Awaited<ReturnType<typeof openUrl>>,
	Error,
	string
> {
	return { mutationFn: (url: string) => openUrl(url) };
}

export function openUserDirMutation(): MutationOptions<
	Awaited<ReturnType<typeof openUserDir>>
> {
	return { mutationFn: openUserDir };
}

async function openUserDir() {
	const result = await commands.openUserDir();

	if (result.status === "error") throw new Error(result.error);

	return result.data;
}
