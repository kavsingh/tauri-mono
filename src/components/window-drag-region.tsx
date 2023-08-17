import { appWindow } from "@tauri-apps/api/window";

export default function WindowDragRegion() {
	function handleMouseDown() {
		void appWindow.startDragging();
	}

	return (
		<div
			class="fixed inset-x-0 top-0 z-[1] h-8 cursor-pointer"
			onMouseDown={handleMouseDown}
		/>
	);
}
