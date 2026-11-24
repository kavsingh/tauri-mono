import { createFileRoute } from "@tanstack/solid-router";

import { Page } from "~/layouts/page";

import { ThemeSwitch } from "./-settings/theme-switch.tsx";

import type { JSX } from "@solidjs/web";

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
