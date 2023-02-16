import { appWindow } from "@tauri-apps/api/window";

export default function WindowDragRegion() {
	function handleMouseDown() {
		void appWindow.startDragging();
	}

	return (
		<div
			class="fixed z-[1] cursor-pointer bs-8 inset-inline-0 block-start-0"
			onMouseDown={handleMouseDown}
		/>
	);
}
