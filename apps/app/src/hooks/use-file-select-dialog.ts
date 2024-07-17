import { open } from "@tauri-apps/plugin-dialog";
import { createSignal } from "solid-js";

import type {
	OpenDialogOptions,
	FileResponse,
} from "@tauri-apps/plugin-dialog";

export default function useFileSelectDialog() {
	const [files, setFiles] = createSignal<string[]>([]);

	async function showDialog(options?: OpenDialogOptions) {
		const response: FileResponse | FileResponse[] | string | string[] | null =
			await open({
				multiple: true,
				directory: false,
				...options,
			});

		if (response === null) {
			setFiles([]);

			return;
		}

		setFiles(
			Array.isArray(response) ? response.map(normalize) : [normalize(response)],
		);
	}

	return [files, showDialog] as const;
}

function normalize(item: string | FileResponse) {
	return typeof item === "string" ? item : item.path;
}
