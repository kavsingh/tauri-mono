import { splitProps } from "solid-js";

import { tm } from "#lib/style";

import type { ComponentProps } from "solid-js";

export function InfoListRoot(props: InfoListRootProps) {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<ul {...passProps} class={tm("m-0 list-none p-0", localProps.class)} />
	);
}

export type InfoListRootProps = Omit<ComponentProps<"ul">, "classList">;

//

export function InfoListEntry(props: InfoListEntryProps) {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<li
			{...passProps}
			class={tm(
				"flex gap-2 border-b border-b-border py-2 last:border-b-0",
				localProps.class,
			)}
		/>
	);
}

export type InfoListEntryProps = Omit<ComponentProps<"li">, "classList">;

//

export function InfoListLabel(props: InfoListLabelProps) {
	const [localProps, passProps] = splitProps(props, ["class"]);

	return (
		<span
			{...passProps}
			class={tm("text-muted-foreground", localProps.class)}
		/>
	);
}

export type InfoListLabelProps = Omit<ComponentProps<"span">, "classList">;

//

export function InfoListValue(props: InfoListValueProps) {
	return <span {...props} />;
}

export type InfoListValueProps = Omit<ComponentProps<"span">, "classList">;

//

export default {
	Root: InfoListRoot,
	Entry: InfoListEntry,
	Label: InfoListLabel,
	Value: InfoListValue,
};
