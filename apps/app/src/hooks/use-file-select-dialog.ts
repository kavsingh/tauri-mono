import { open } from "@tauri-apps/plugin-dialog";
import { createSignal } from "solid-js";

import type { OpenDialogOptions } from "@tauri-apps/plugin-dialog";

export default function useFileSelectDialog() {
	const [files, setFiles] = createSignal<string[]>([]);

	async function showDialog(options?: OpenDialogOptions) {
		const response: string[] | string | null = await open({
			multiple: true,
			directory: false,
			...options,
		});

		if (response === null) {
			setFiles([]);

			return;
		}

		setFiles(Array.isArray(response) ? response : [response]);
	}

	return [files, showDialog] as const;
}
