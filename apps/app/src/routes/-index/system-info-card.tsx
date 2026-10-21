import { Effect } from "effect";
import { Show, createResource } from "solid-js";

import { Card } from "~/components/card";
import { InfoList } from "~/components/info-list";
import { systemInfoEffect } from "~/services/tauri";

import type { JSX } from "solid-js";

export function SystemInfoCard(): JSX.Element {
	const [info] = createResource(() => Effect.runPromise(systemInfoEffect()));

	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>System info</Card.Title>
			</Card.Header>
			<Card.Content>
				<Show when={info()} fallback={<>loading...</>} keyed>
					{(currentInfo) => (
						<InfoList.Root>
							<InfoList.Entry>
								<InfoList.Label>os</InfoList.Label>
								<InfoList.Value>{currentInfo.osFullname}</InfoList.Value>
							</InfoList.Entry>
							<InfoList.Entry>
								<InfoList.Label>arch</InfoList.Label>
								<InfoList.Value>{currentInfo.osArch}</InfoList.Value>
							</InfoList.Entry>
						</InfoList.Root>
					)}
				</Show>
			</Card.Content>
		</Card.Root>
	);
}
