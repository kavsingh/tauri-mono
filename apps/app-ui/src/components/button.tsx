// https://ui.shadcn.com/docs/components/button

import { splitProps } from "solid-js";

import { tv } from "~/lib/style";

import type { ComponentProps, JSX } from "solid-js";
import type { VariantProps } from "~/lib/style";

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export const buttonVariants = tv({
	base: "inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
	variants: {
		variant: {
			default:
				"bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
			destructive:
				"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline:
				"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary:
				"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline",
		},
		size: {
			default: "px-4 py-2 block-9",
			sm: "rounded-md px-3 text-xs block-8",
			lg: "rounded-md px-8 block-10",
			icon: "block-9 inline-9",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

export interface ButtonProps
	extends Omit<ComponentProps<"button">, "classList">, ButtonVariantProps {}

export function Button(props: ButtonProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, [
		"class",
		"type",
		"variant",
		"size",
	]);

	return (
		<button
			{...passProps}
			type={localProps.type ?? "button"}
			class={buttonVariants({
				variant: localProps.variant,
				size: localProps.size,
				class: localProps.class,
			})}
		/>
	);
}
