import type { ParentProps } from "solid-js";

export default function StatusBadge(props: ParentProps) {
	return (
		<div class="rounded bg-neutral-500 p-1 text-neutral-50">
			{props.children}
		</div>
	);
}
