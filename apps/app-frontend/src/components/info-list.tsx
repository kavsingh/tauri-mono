import { omit } from "solid-js";

import { cn } from "~/lib/style";

import type { ComponentProps, JSX } from "@solidjs/web";

interface InfoListRootProps extends Omit<ComponentProps<"ul">, "class"> {
	class?: string | undefined;
}

function InfoListRoot(props: InfoListRootProps): JSX.Element {
	const passProps = omit(props, "class");

	return <ul {...passProps} class={cn("m-0 list-none p-0", props.class)} />;
}

//

interface InfoListEntryProps extends Omit<ComponentProps<"li">, "class"> {
	class?: string | undefined;
}

function InfoListEntry(props: InfoListEntryProps): JSX.Element {
	const passProps = omit(props, "class");

	return (
		<li
			{...passProps}
			class={cn(
				"flex gap-2 border-be border-be-border py-2 last:border-be-0",
				props.class,
			)}
		/>
	);
}

//

interface InfoListLabelProps extends Omit<ComponentProps<"span">, "class"> {
	class?: string | undefined;
}

function InfoListLabel(props: InfoListLabelProps): JSX.Element {
	const passProps = omit(props, "class");

	return (
		<span {...passProps} class={cn("text-muted-foreground", props.class)} />
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
