import { Show } from "solid-js";

import Card from "#components/card";
import useSystemInfo from "#hooks/use-system-info";
import { formatMem } from "#lib/format";

import MemoryGraph from "./memory-graph";

import type { ParentProps } from "solid-js";

export default function SystemInfoCard() {
	const infoQuery = useSystemInfo();

	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>System info</Card.Title>
			</Card.Header>
			<Card.Content>
				<Show when={infoQuery.data} fallback={<>loading...</>} keyed>
					{(info) => (
						<div class="space-y-6">
							<ul class="m-0 list-none p-0">
								<InfoEntry>
									<InfoEntryLabel>os</InfoEntryLabel>
									<span>
										{info.osFullname} ({info.osArch})
									</span>
								</InfoEntry>
								<InfoEntry>
									<InfoEntryLabel>total memory</InfoEntryLabel>
									<span>{formatMem(info.memTotal ?? "")}</span>
								</InfoEntry>
							</ul>
						</div>
					)}
				</Show>
				<div class="aspect-[3] w-full max-w-96">
					<MemoryGraph systemInfo={infoQuery.data} />
				</div>
			</Card.Content>
		</Card.Root>
	);
}

function InfoEntry(props: ParentProps) {
	return (
		<li class="flex gap-2 border-b border-b-border p-2 last:border-b-0">
			{props.children}
		</li>
	);
}

function InfoEntryLabel(props: ParentProps) {
	return <span class="text-muted-foreground">{props.children}</span>;
}
