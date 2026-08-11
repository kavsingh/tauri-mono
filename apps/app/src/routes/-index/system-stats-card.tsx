import { useQuery } from "@tanstack/solid-query";
import { Result } from "neverthrow";
import { Show, createMemo } from "solid-js";

import { Card } from "~/components/card";
import { ChronoGraph } from "~/components/chrono-graph";
import { InfoList } from "~/components/info-list";
import { formatMem } from "~/lib/format";
import { systemStatsQuery } from "~/services/tauri";

import type { JSX } from "solid-js";
import type { Sample } from "~/components/chrono-graph";
import type { SystemStats } from "~/tauri-bindings.gen";

function MemoryGraph(props: { systemStats: SystemStats | undefined }) {
	const sample = createMemo<Sample | undefined>(() => {
		const value = props.systemStats?.memUsed;

		return value
			? { value: Result.fromThrowable(BigInt)(value).unwrapOr(0n) }
			: undefined;
	});

	const maxValue = createMemo<bigint>(() => {
		const value = props.systemStats?.memTotal;

		return value ? Result.fromThrowable(BigInt)(value).unwrapOr(0n) : 0n;
	});

	return (
		<ChronoGraph
			sampleSource={sample}
			minValue={0n}
			maxValue={maxValue()}
			class="rounded-lg block-24 inline-full"
		/>
	);
}

export function SystemStatsCard(): JSX.Element {
	const statsQuery = useQuery(systemStatsQuery);

	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>System stats</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-[1fr_26ch] gap-4">
					<MemoryGraph systemStats={statsQuery.data} />
					<Show when={statsQuery.data} fallback={<>loading...</>} keyed>
						{(stats) => (
							<InfoList.Root>
								<InfoList.Entry>
									<InfoList.Label>total memory</InfoList.Label>
									<InfoList.Value>
										{formatMem(stats.memTotal ?? "")}
									</InfoList.Value>
								</InfoList.Entry>
								<InfoList.Entry>
									<InfoList.Label>used memory</InfoList.Label>
									<InfoList.Value>
										{formatMem(stats.memUsed ?? "")}
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
