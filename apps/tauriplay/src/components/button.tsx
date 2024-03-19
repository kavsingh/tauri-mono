import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

export default function Button(
	_props: Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "classList">,
) {
	const [local, props] = splitProps(_props, ["class"]);

	return (
		<button
			{...props}
			class={twMerge(
				"rounded border border-neutral-500 px-2 py-1 transition-colors hover:border-neutral-950 dark:hover:border-neutral-50",
				local.class,
			)}
		/>
	);
}
