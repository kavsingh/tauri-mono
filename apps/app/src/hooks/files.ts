import { getCurrentWebview } from "@tauri-apps/api/webview";
import { open } from "@tauri-apps/plugin-dialog";
import { createSignal, onCleanup } from "solid-js";

import type { OpenDialogOptions } from "@tauri-apps/plugin-dialog";
import type { JSX } from "solid-js";

export function useFileDrop() {
	const [droppedFiles, setDroppedFiles] = createSignal<string[]>([]);
	const [isActive, setIsActive] = createSignal(false);
	// Not ideal to track this twice. TODO: File drop handler react to
	// isActive directly (use store instead of signals)
	let isOverElement = false;

	const unlistenPromise = getCurrentWebview().onDragDropEvent((event) => {
		if (isOverElement && event.payload.type === "drop") {
			setDroppedFiles(event.payload.paths);
		}
	});

	const onDragEnter: DragEventHandler = (event) => {
		event.preventDefault();
		isOverElement = true;
		setIsActive(isOverElement);
	};

	const onDragLeave: DragEventHandler = (event) => {
		event.preventDefault();
		isOverElement = false;
		setIsActive(isOverElement);
	};

	onCleanup(() => {
		void unlistenPromise.then((unlisten) => {
			unlisten();
		});
	});

	return [
		{ isActive, files: droppedFiles },
		{ onDragEnter, onDragLeave, onDrop: onDragLeave },
	] as const;
}

export function useFileSelectDialog() {
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

type DragEventHandler = JSX.EventHandlerUnion<HTMLElement, DragEvent>;
