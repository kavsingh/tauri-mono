import { open } from "@tauri-apps/api/dialog";

import type { OpenDialogOptions } from "@tauri-apps/api/dialog";

export async function selectFilesWithDialog(options?: OpenDialogOptions) {
	const selected = await open({ multiple: true, directory: false, ...options });

	if (Array.isArray(selected)) return selected;

	return selected ? [selected] : [];
}
