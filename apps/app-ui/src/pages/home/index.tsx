import { Button } from "#components/button";
import { Page } from "#layouts/page";
import { createScopedLogger } from "#logger";
import { openUrl } from "@tauri-apps/plugin-opener";

import { SystemInfoCard } from "./system-info-card";
import { SystemStatsCard } from "./system-stats-card";

import type { JSX } from "solid-js";

const logger = createScopedLogger("<Home />");

async function openExternal() {
	try {
		await openUrl("https://kavsingh.github.io");
	} catch (cause) {
		logger.error("failed to open", cause);
	}
}

export function Home(): JSX.Element {
	return (
		<>
			<Page.Header>Home</Page.Header>
			<Page.Content>
				<div class="space-y-6">
					<SystemInfoCard />
					<SystemStatsCard />
					<Button onClick={() => void openExternal()}>External url</Button>
				</div>
			</Page.Content>
		</>
	);
}
