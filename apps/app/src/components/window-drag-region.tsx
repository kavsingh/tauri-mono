import { getCurrentWindow } from "@tauri-apps/api/window";

import type { ComponentProps } from "solid-js";

export default function WindowDragRegion(
	props: Pick<ComponentProps<"div">, "class">,
) {
	function handleMouseDown() {
		void getCurrentWindow().startDragging();
	}

	return <div class={props.class} onMouseDown={handleMouseDown} />;
}
