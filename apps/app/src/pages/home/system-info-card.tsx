import { Show, createMemo } from "solid-js";

import Card from "#components/card";
import ChronoGraph from "#components/chrono-graph";
import useSystemInfo from "#hooks/use-system-info";
import { tryOr } from "#lib/error";
import { formatMem } from "#lib/format";

import type { SystemInfo } from "#__generated__/bindings";
import type { Sample } from "#components/chrono-graph";
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
				<MemoryGraph systemInfo={infoQuery.data} />
			</Card.Content>
		</Card.Root>
	);
}

function MemoryGraph(props: { systemInfo: SystemInfo | undefined }) {
	const sample = createMemo<Sample | undefined>(() => {
		const value = props.systemInfo?.memAvailable;

		return value ? { value: tryOr(() => BigInt(value), 0n) } : undefined;
	});

	const maxValue = createMemo<bigint>(() => {
		const value = props.systemInfo?.memTotal;

		return value ? tryOr(() => BigInt(value), 0n) : 0n;
	});

	return (
		<ChronoGraph
			sampleSource={sample}
			minValue={0n}
			maxValue={maxValue()}
			class="aspect-[5] w-full max-w-96 rounded-lg"
		/>
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
