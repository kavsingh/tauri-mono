import type { JSX, ParentProps } from "solid-js";

function PageHeader(props: ParentProps): JSX.Element {
	return (
		<header class="sticky inset-bs-0 bg-background/50 p-4 pbs-8 backdrop-blur-md">
			<h2 class="text-3xl leading-none font-semibold">{props.children}</h2>
		</header>
	);
}

function PageContent(props: ParentProps): JSX.Element {
	return <main class="p-4">{props.children}</main>;
}

const Page = {
	Header: PageHeader,
	Content: PageContent,
};

export { Page, PageHeader, PageContent };
