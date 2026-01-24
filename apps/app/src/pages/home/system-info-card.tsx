import { useQuery } from "@tanstack/solid-query";
import { Show } from "solid-js";

import { commands } from "#__generated__/bindings";
import { Card } from "#components/card";
import { InfoList } from "#components/info-list";

import type { JSX } from "solid-js";

export function SystemInfoCard(): JSX.Element {
	const infoQuery = useQuery(() => ({
		queryKey: ["systemInfo"],
		queryFn: () => commands.getSystemInfo(),
	}));

	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>System info</Card.Title>
			</Card.Header>
			<Card.Content>
				<Show when={infoQuery.data} fallback={<>loading...</>} keyed>
					{(info) => (
						<InfoList.Root>
							<InfoList.Entry>
								<InfoList.Label>os</InfoList.Label>
								<InfoList.Value>{info.osFullname}</InfoList.Value>
							</InfoList.Entry>
							<InfoList.Entry>
								<InfoList.Label>arch</InfoList.Label>
								<InfoList.Value>{info.osArch}</InfoList.Value>
							</InfoList.Entry>
						</InfoList.Root>
					)}
				</Show>
			</Card.Content>
		</Card.Root>
	);
}
