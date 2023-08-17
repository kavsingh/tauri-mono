import { createEffect, createSignal, mergeProps, onCleanup } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { Accessor, JSX, ParentProps } from "solid-js";

export default function Pulse(_props: ParentProps<Props>) {
	const props = mergeProps({ durationMs: 1200 }, _props);
	const [isActive, setIsActive] = createSignal(false);
	let fadeTimeout: NodeJS.Timeout;

	const triggerPulse = () => {
		setIsActive(true);
		fadeTimeout = setTimeout(() => setIsActive(false), props.durationMs);
	};

	createEffect(() => {
		if (props.trigger?.()) triggerPulse();
	});

	onCleanup(() => {
		clearTimeout(fadeTimeout);
	});

	return (
		<div
			{...props}
			style={{ "animation-duration": `${props.durationMs}ms` }}
			class={twMerge(
				"opacity-0",
				isActive() && "animate-[pulse-out_ease-out_forwards]",
				props.class,
			)}
		>
			{props.children}
		</div>
	);
}

type Props = {
	durationMs?: number;
	trigger?: Accessor<unknown>;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "classList">;
