import { Result } from "effect";
import { Show, createMemo } from "solid-js";

import { Card } from "~/components/card";
import { ChronoGraph } from "~/components/chrono-graph";
import { InfoList } from "~/components/info-list";
import { useSystemStats } from "~/hooks/system-stats";
import { formatMem } from "~/lib/format";

import type { JSX } from "solid-js";
import type { Sample } from "~/components/chrono-graph";
import type { SystemStats } from "~/tauri-bindings.gen";

function toBigInt(value?: string | null) {
	return Result.try(() => BigInt(value ?? "0")).pipe(
		Result.getOrElse(() => 0n),
	);
}

function MemoryGraph(props: { systemStats: SystemStats | undefined }) {
	const sample = createMemo<Sample | undefined>(() => {
		return { value: toBigInt(props.systemStats?.memUsed) };
	});

	const maxValue = createMemo<bigint>(() => {
		return toBigInt(props.systemStats?.memTotal);
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
	const stats = useSystemStats();

	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>System stats</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-[1fr_26ch] gap-4">
					<MemoryGraph systemStats={stats()} />
					<Show when={stats()} fallback={<>loading...</>} keyed>
						{(currentStats) => (
							<InfoList.Root>
								<InfoList.Entry>
									<InfoList.Label>total memory</InfoList.Label>
									<InfoList.Value>
										{formatMem(currentStats.memTotal ?? "")}
									</InfoList.Value>
								</InfoList.Entry>
								<InfoList.Entry>
									<InfoList.Label>used memory</InfoList.Label>
									<InfoList.Value>
										{formatMem(currentStats.memUsed ?? "")}
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
