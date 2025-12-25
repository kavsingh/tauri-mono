import { Page } from "#layouts/page";

import { ThemeSwitch } from "./theme-switch";

import type { JSX } from "solid-js";

export function Settings(): JSX.Element {
	return (
		<>
			<Page.Header>Settings</Page.Header>
			<Page.Content>
				<ThemeSwitch />
			</Page.Content>
		</>
	);
}
