import { Show, createMemo } from "solid-js";

import Card from "#components/card";
import ChronoGraph from "#components/chrono-graph";
import useSystemStats from "#hooks/use-system-stats";
import { tryOr } from "#lib/error";
import { formatMem } from "#lib/format";

import InfoList from "../../components/info-list";

import type { SystemStats } from "#__generated__/bindings";
import type { Sample } from "#components/chrono-graph";

export default function SystemStatsCard() {
	const statsQuery = useSystemStats();

	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>System stats</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-[1fr_26ch] gap-4">
					<MemoryGraph systemStats={statsQuery.data} />
					<Show when={statsQuery.data} fallback={<>loading...</>} keyed>
						{(info) => (
							<InfoList.Root>
								<InfoList.Entry>
									<InfoList.Label>total memory</InfoList.Label>
									<InfoList.Value>
										{formatMem(info.memTotal ?? "")}
									</InfoList.Value>
								</InfoList.Entry>
								<InfoList.Entry>
									<InfoList.Label>available memory</InfoList.Label>
									<InfoList.Value>
										{formatMem(info.memAvailable ?? "")}
									</InfoList.Value>
								</InfoList.Entry>
							</InfoList.Root>
						)}
					</Show>
				</div>
			</Card.Content>
		</Card.Root>
	);
}

function MemoryGraph(props: { systemStats: SystemStats | undefined }) {
	const sample = createMemo<Sample | undefined>(() => {
		const value = props.systemStats?.memAvailable;

		return value ? { value: tryOr(() => BigInt(value), 0n) } : undefined;
	});

	const maxValue = createMemo<bigint>(() => {
		const value = props.systemStats?.memTotal;

		return value ? tryOr(() => BigInt(value), 0n) : 0n;
	});

	return (
		<ChronoGraph
			sampleSource={sample}
			minValue={0n}
			maxValue={maxValue()}
			class="h-24 w-full rounded-lg"
		/>
	);
}
