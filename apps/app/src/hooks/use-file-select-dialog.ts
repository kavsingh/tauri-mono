import { open } from "@tauri-apps/api/dialog";
import { createSignal } from "solid-js";

import type { OpenDialogOptions } from "@tauri-apps/api/dialog";

export default function useFileSelectDialog() {
	const [files, setFiles] = createSignal<string[]>([]);

	async function showDialog(options?: OpenDialogOptions) {
		const selected =
			(await open({ multiple: true, directory: false, ...options })) ?? [];

		setFiles(Array.isArray(selected) ? selected : [selected]);
	}

	return [files, showDialog] as const;
}
