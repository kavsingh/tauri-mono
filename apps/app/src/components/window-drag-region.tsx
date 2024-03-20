import { appWindow } from "@tauri-apps/api/window";

export default function WindowDragRegion(props: {
	class?: string | undefined;
}) {
	function handleMouseDown() {
		void appWindow.startDragging();
	}

	return <div class={props.class} onMouseDown={handleMouseDown} />;
}
