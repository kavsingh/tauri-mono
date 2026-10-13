// https://ui.shadcn.com/docs/components/card

import { splitProps } from "solid-js";

import { tm } from "~/lib/style";

import type { ComponentProps, JSX } from "solid-js";

type CardRootProps = Omit<ComponentProps<"div">, "classList">;

function CardRoot(props: CardRootProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<div
			{...passProps}
			class={tm(
				"rounded-xl border border-border bg-card text-card-foreground shadow-sm",
				localProps.class,
			)}
		/>
	);
}

//

type CardHeaderProps = Omit<ComponentProps<"div">, "classList">;

function CardHeader(props: CardHeaderProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<div
			{...passProps}
			class={tm("flex flex-col space-y-1.5 p-6", localProps.class)}
		/>
	);
}

//

type CardTitleProps = Omit<ComponentProps<"h3">, "classList">;

function CardTitle(props: CardTitleProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class", "children"]);

	return (
		<h3
			{...passProps}
			class={tm("leading-none font-semibold tracking-tight", localProps.class)}
		>
			{localProps.children}
		</h3>
	);
}

//

type CardDescriptionProps = Omit<ComponentProps<"p">, "classList">;

function CardDescription(props: CardDescriptionProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<p
			{...passProps}
			class={tm("text-sm text-muted-foreground", localProps.class)}
		/>
	);
}

//

type CardContentProps = Omit<ComponentProps<"div">, "classList">;

function CardContent(props: CardContentProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return <div {...passProps} class={tm("p-6 pbs-0", localProps.class)} />;
}

//

type CardFooterProps = Omit<ComponentProps<"div">, "classList">;

function CardFooter(props: CardFooterProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<div
			{...passProps}
			class={tm("flex items-center p-6 pbs-0", localProps.class)}
		/>
	);
}

//

const Card = {
	Root: CardRoot,
	Header: CardHeader,
	Title: CardTitle,
	Description: CardDescription,
	Content: CardContent,
	Footer: CardFooter,
};

export {
	Card,
	CardRoot,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
};
export type {
	CardRootProps,
	CardHeaderProps,
	CardTitleProps,
	CardDescriptionProps,
	CardContentProps,
	CardFooterProps,
};
