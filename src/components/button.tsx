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
				"rounded border border-accent100 px-2 py-1 hover:border-accent400 focus-visible:border-accent400 active:border-accent400",
				local.class,
			)}
		/>
	);
}
