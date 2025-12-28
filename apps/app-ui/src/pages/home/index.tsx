import { Button } from "#components/button";
import { Page } from "#layouts/page";
import { awaitOrElse } from "#lib/error";
import { openUserDirMutation } from "#lib/mutations";
import { createScopedLogger } from "#logger";
import { useMutation } from "@tanstack/solid-query";
import { openUrl, openPath } from "@tauri-apps/plugin-opener";

import { SystemInfoCard } from "./system-info-card";
import { SystemStatsCard } from "./system-stats-card";

import type { JSX } from "solid-js";

const logger = createScopedLogger("<Home />");

function WebButton() {
	return (
		<Button
			onClick={() => {
				void awaitOrElse(
					openUrl("https://kavsingh.github.io"),
					logger.error.bind(undefined, "failed to open web"),
				);
			}}
		>
			Open Web
		</Button>
	);
}

function AppButton() {
	return (
		<Button
			onClick={() => {
				void awaitOrElse(
					openUrl("native-access://library"),
					logger.error.bind(undefined, "failed to open app"),
				);
			}}
		>
			Open App
		</Button>
	);
}

function FilepathButton() {
	return (
		<Button
			onClick={() => {
				void awaitOrElse(
					openPath("/Users/"),
					logger.error.bind(undefined, "failed to open path"),
				);
			}}
		>
			Open Path
		</Button>
	);
}

function FilepathCmdButton() {
	const open = useMutation(() => ({
		...openUserDirMutation(),
		onError: (cause) => {
			logger.error("failed to open path", cause);
		},
	}));

	return <Button onClick={() => open.mutate()}>Open Path (cmd)</Button>;
}

export function Home(): JSX.Element {
	return (
		<>
			<Page.Header>Home</Page.Header>
			<Page.Content>
				<div class="space-y-6">
					<SystemInfoCard />
					<SystemStatsCard />
					<div class="flex items-center gap-1.5">
						<WebButton />
						<AppButton />
						<FilepathButton />
						<FilepathCmdButton />
					</div>
				</div>
			</Page.Content>
		</>
	);
}
