import { listen } from "@tauri-apps/api/event";
import { createSignal, onCleanup } from "solid-js";

import type { FileDropEvent } from "@tauri-apps/api/window";
import type { JSX } from "solid-js";

export default function useFileDrop() {
	const [droppedFiles, setDroppedFiles] = createSignal<string[]>([]);
	const [isActive, setIsActive] = createSignal(false);
	// Not ideal to track this twice. TODO: File drop handler react to
	// isActive directly
	let isOverElement = false;

	const unlistenPromise = listen<FileDropEvent>(
		"tauri://file-drop",
		(event) => {
			if (!isOverElement) return;
			// typings seem to be incorrect
			setDroppedFiles(event.payload as unknown as string[]);
		}
	);

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
		void unlistenPromise.then((unlisten) => unlisten());
	});

	return [
		{ isActive, files: droppedFiles },
		{ onDragEnter, onDragLeave, onDrop: onDragLeave },
	] as const;
}

type DragEventHandler = JSX.EventHandlerUnion<HTMLElement, DragEvent>;
