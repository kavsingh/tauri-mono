// https://ui.shadcn.com/docs/components/card

import { omit } from "solid-js";

import { cn } from "~/lib/style";

import type { ComponentProps, JSX } from "@solidjs/web";

interface CardRootProps extends Omit<ComponentProps<"div">, "class"> {
	class?: string | undefined;
}

function CardRoot(props: CardRootProps): JSX.Element {
	const passProps = omit(props, "class");

	return (
		<div
			{...passProps}
			class={cn(
				"rounded-xl border border-border bg-card text-card-foreground shadow-sm",
				props.class,
			)}
		/>
	);
}

//

interface CardHeaderProps extends Omit<ComponentProps<"div">, "class"> {
	class?: string | undefined;
}

function CardHeader(props: CardHeaderProps): JSX.Element {
	const passProps = omit(props, "class");

	return (
		<div
			{...passProps}
			class={cn("flex flex-col space-y-1.5 p-6", props.class)}
		/>
	);
}

//

interface CardTitleProps extends Omit<ComponentProps<"h3">, "class"> {
	class?: string | undefined;
}

function CardTitle(props: CardTitleProps): JSX.Element {
	const passProps = omit(props, "class", "children");

	return (
		<h3
			{...passProps}
			class={cn("leading-none font-semibold tracking-tight", props.class)}
		>
			{props.children}
		</h3>
	);
}

//

interface CardDescriptionProps extends Omit<ComponentProps<"p">, "class"> {
	class?: string | undefined;
}

function CardDescription(props: CardDescriptionProps): JSX.Element {
	const passProps = omit(props, "class");

	return (
		<p
			{...passProps}
			class={cn("text-sm text-muted-foreground", props.class)}
		/>
	);
}

//

interface CardContentProps extends Omit<ComponentProps<"div">, "class"> {
	class?: string | undefined;
}

function CardContent(props: CardContentProps): JSX.Element {
	const passProps = omit(props, "class");

	return <div {...passProps} class={cn("p-6 pbs-0", props.class)} />;
}

//

interface CardFooterProps extends Omit<ComponentProps<"div">, "class"> {
	class?: string | undefined;
}

function CardFooter(props: CardFooterProps): JSX.Element {
	const passProps = omit(props, "class");

	return (
		<div
			{...passProps}
			class={cn("flex items-center p-6 pbs-0", props.class)}
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
