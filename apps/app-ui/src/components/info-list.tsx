import { splitProps } from "solid-js";

import { tm } from "~/lib/style";

import type { ComponentProps, JSX } from "solid-js";

export type InfoListRootProps = Omit<ComponentProps<"ul">, "classList">;

export function InfoListRoot(props: InfoListRootProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<ul {...passProps} class={tm("m-0 list-none p-0", localProps.class)} />
	);
}

//

export type InfoListEntryProps = Omit<ComponentProps<"li">, "classList">;

export function InfoListEntry(props: InfoListEntryProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<li
			{...passProps}
			class={tm(
				"flex gap-2 border-be border-be-border py-2 last:border-be-0",
				localProps.class,
			)}
		/>
	);
}

//

export type InfoListLabelProps = Omit<ComponentProps<"span">, "classList">;

export function InfoListLabel(props: InfoListLabelProps): JSX.Element {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<span
			{...passProps}
			class={tm("text-muted-foreground", localProps.class)}
		/>
	);
}

//

export type InfoListValueProps = Omit<ComponentProps<"span">, "classList">;

export function InfoListValue(props: InfoListValueProps): JSX.Element {
	return <span {...props} />;
}

//

export const InfoList = {
	Root: InfoListRoot,
	Entry: InfoListEntry,
	Label: InfoListLabel,
	Value: InfoListValue,
};
