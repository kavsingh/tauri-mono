import { splitProps } from "solid-js";

import { cn } from "~/lib/style";

import type { ComponentProps, JSX } from "solid-js";

type InfoListRootProps = Omit<ComponentProps<"ul">, "classList">;

function InfoListRoot(props: InfoListRootProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<ul {...passProps} class={cn("m-0 list-none p-0", localProps.class)} />
	);
}

//

type InfoListEntryProps = Omit<ComponentProps<"li">, "classList">;

function InfoListEntry(props: InfoListEntryProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<li
			{...passProps}
			class={cn(
				"flex gap-2 border-be border-be-border py-2 last:border-be-0",
				localProps.class,
			)}
		/>
	);
}

//

type InfoListLabelProps = Omit<ComponentProps<"span">, "classList">;

function InfoListLabel(props: InfoListLabelProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<span
			{...passProps}
			class={cn("text-muted-foreground", localProps.class)}
		/>
	);
}

//

type InfoListValueProps = Omit<ComponentProps<"span">, "classList">;

function InfoListValue(props: InfoListValueProps): JSX.Element {
	return <span {...props} />;
}

//

const InfoList = {
	Root: InfoListRoot,
	Entry: InfoListEntry,
	Label: InfoListLabel,
	Value: InfoListValue,
};

export { InfoList, InfoListRoot, InfoListEntry, InfoListLabel, InfoListValue };
export type {
	InfoListRootProps,
	InfoListEntryProps,
	InfoListLabelProps,
	InfoListValueProps,
};
