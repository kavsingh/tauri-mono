import { createFileRoute } from "@tanstack/solid-router";

import { Page } from "#layouts/page";

import { ThemeSwitch } from "./-settings/theme-switch";

import type { JSX } from "solid-js";

function Settings(): JSX.Element {
	return (
		<>
			<Page.Header>Settings</Page.Header>
			<Page.Content>
				<ThemeSwitch />
			</Page.Content>
		</>
	);
}

export const Route = createFileRoute("/settings")({ component: Settings });
