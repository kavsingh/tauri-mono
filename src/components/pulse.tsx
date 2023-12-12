import {
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	splitProps,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { Accessor, JSX, ParentProps } from "solid-js";

export default function Pulse(_props: ParentProps<Props>) {
	const [isActive, setIsActive] = createSignal(false);
	const [localProps, passProps] = splitProps(_props, [
		"class",
		"durationMs",
		"trigger",
	]);
	const duration = createMemo(() => localProps.durationMs ?? 1200);
	let fadeTimeout: NodeJS.Timeout;

	function triggerPulse() {
		setIsActive(true);
		fadeTimeout = setTimeout(() => setIsActive(false), duration());
	}

	createEffect(() => {
		if (localProps.trigger?.()) triggerPulse();
	});

	onCleanup(() => {
		clearTimeout(fadeTimeout);
	});

	return (
		<div
			{...passProps}
			style={{ "animation-duration": `${duration()}ms` }}
			class={twMerge(
				"opacity-0",
				isActive() && "animate-[pulse-out_ease-out_forwards]",
				localProps.class,
			)}
		/>
	);
}

type Props = {
	durationMs?: number;
	trigger?: Accessor<unknown>;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "classList">;
