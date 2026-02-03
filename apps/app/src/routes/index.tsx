import { createFileRoute } from "@tanstack/solid-router";

import { Page } from "#layouts/page";

import { SystemInfoCard } from "./-index/system-info-card";
import { SystemStatsCard } from "./-index/system-stats-card";

import type { JSX } from "solid-js";

export function Index(): JSX.Element {
	return (
		<>
			<Page.Header>Home</Page.Header>
			<Page.Content>
				<div class="space-y-6">
					<SystemInfoCard />
					<SystemStatsCard />
				</div>
			</Page.Content>
		</>
	);
}

export const Route = createFileRoute("/")({ component: Index });
