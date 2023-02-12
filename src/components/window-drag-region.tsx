import { appWindow } from "@tauri-apps/api/window";

import type { Component, JSX } from "solid-js";

const WindowDragRegion: Component = () => {
	const handleMouseDown: MouseEventHandler = () => {
		void appWindow.startDragging();
	};

	return (
		<div
			class="fixed z-[1] cursor-pointer bs-8 inset-inline-0 block-start-0"
			onMouseDown={handleMouseDown}
		/>
	);
};

export default WindowDragRegion;

type MouseEventHandler = JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
