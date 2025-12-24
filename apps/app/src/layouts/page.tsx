import type { JSX, ParentProps } from "solid-js";

export function PageHeader(props: ParentProps): JSX.Element {
	return (
		<header class="sticky top-0 bg-background/50 p-4 pt-8 backdrop-blur-md">
			<h2 class="text-3xl leading-none font-semibold">{props.children}</h2>
		</header>
	);
}

export function PageContent(props: ParentProps): JSX.Element {
	return <main class="p-4">{props.children}</main>;
}

export const Page = {
	Header: PageHeader,
	Content: PageContent,
};
