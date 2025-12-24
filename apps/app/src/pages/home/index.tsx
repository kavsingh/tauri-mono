import { Page } from "#layouts/page";

import { SystemInfoCard } from "./system-info-card";
import { SystemStatsCard } from "./system-stats-card";

import type { JSX } from "solid-js";

export function Home(): JSX.Element {
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
