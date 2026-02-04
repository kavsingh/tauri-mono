import { useMutation } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { openPath } from "@tauri-apps/plugin-opener";

import { Button } from "#components/button";
import { Page } from "#layouts/page";
import { openExternalUrlMutation, openUserDirMutation } from "#lib/mutations";
import { createScopedLogger } from "#logger";

import { SystemInfoCard } from "./-index/system-info-card";
import { SystemStatsCard } from "./-index/system-stats-card";

import type { ButtonProps } from "#components/button";
import type { JSX, ParentProps } from "solid-js";

const logger = createScopedLogger("<Home />");

export function Index(): JSX.Element {
	// this is expected to pass - specific command handled by rs app
	const openUserDir = useMutation(() => ({
		...openUserDirMutation(),
		onError: (cause) => {
			logger.error("failed to open user dir", cause);
		},
	}));

	// this is expected to fail due to permission boundaries
	const openFilepath = useMutation(() => ({
		mutationFn: (filepath: string) => openPath(filepath),
		onError: (cause) => {
			logger.error("failed to open path", cause);
		},
	}));

	return (
		<>
			<Page.Header>Home</Page.Header>
			<Page.Content>
				<div class="space-y-6">
					<SystemInfoCard />
					<SystemStatsCard />
					<div class="space-y-1.5">
						<div class="flex flex-wrap items-center gap-1.5">
							<ExternalUrlButton url="https://kavsingh.github.io">
								Open url
							</ExternalUrlButton>
							<ExternalUrlButton url="native-access://library">
								Open app
							</ExternalUrlButton>
							<Button onClick={() => openUserDir.mutate()}>
								Open user dir (specific)
							</Button>
						</div>
						<div class="flex flex-wrap items-center gap-1.5">
							<ExternalUrlButton
								variant="destructive"
								url="https://www.google.com"
							>
								Open blocked url
							</ExternalUrlButton>
							<ExternalUrlButton variant="destructive" url="steam://library">
								Open blocked app
							</ExternalUrlButton>
							<Button
								variant="destructive"
								onClick={() => openFilepath.mutate("/Users/")}
							>
								Open user dir (generic)
							</Button>
						</div>
					</div>
				</div>
			</Page.Content>
		</>
	);
}

export const Route = createFileRoute("/")({ component: Index });

function ExternalUrlButton(
	props: ParentProps<{ url: string; variant?: ButtonProps["variant"] }>,
) {
	const open = useMutation(() => ({
		...openExternalUrlMutation(),
		onError: (cause) => {
			logger.error("failed to open url", cause);
		},
	}));

	return (
		<Button variant={props.variant} onClick={() => open.mutate(props.url)}>
			{props.children}
		</Button>
	);
}
