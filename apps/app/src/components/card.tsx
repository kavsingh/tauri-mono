// https://ui.shadcn.com/docs/components/card

import { splitProps } from "solid-js";

import { tm } from "#lib/style";

import type { ComponentProps } from "solid-js";

export function CardRoot(props: CardRootProps) {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<div
			{...passProps}
			class={tm(
				"rounded-xl border border-border bg-card text-card-foreground shadow",
				localProps.class,
			)}
		/>
	);
}

export type CardRootProps = Omit<ComponentProps<"div">, "classList">;

//

export function CardHeader(props: CardHeaderProps) {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<div
			{...passProps}
			class={tm("flex flex-col space-y-1.5 p-6", localProps.class)}
		/>
	);
}

export type CardHeaderProps = Omit<ComponentProps<"div">, "classList">;

//

export function CardTitle(props: CardTitleProps) {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<h3
			{...passProps}
			class={tm("leading-none font-semibold tracking-tight", localProps.class)}
		/>
	);
}

export type CardTitleProps = Omit<ComponentProps<"h3">, "classList">;

//

export function CardDescription(props: CardDescriptionProps) {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<p
			{...passProps}
			class={tm("text-sm text-muted-foreground", localProps.class)}
		/>
	);
}

export type CardDescriptionProps = Omit<ComponentProps<"p">, "classList">;

//

export function CardContent(props: CardContentProps) {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return <div {...passProps} class={tm("p-6 pt-0", localProps.class)} />;
}

export type CardContentProps = Omit<ComponentProps<"div">, "classList">;

//

export function CardFooter(props: CardFooterProps) {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<div
			{...passProps}
			class={tm("flex items-center p-6 pt-0", localProps.class)}
		/>
	);
}

export type CardFooterProps = Omit<ComponentProps<"div">, "classList">;

//

export default {
	Root: CardRoot,
	Header: CardHeader,
	Title: CardTitle,
	Description: CardDescription,
	Content: CardContent,
	Footer: CardFooter,
};
