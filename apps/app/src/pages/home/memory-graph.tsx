import { createMemo } from "solid-js";

import ChronoGraph from "#components/chrono-graph";
import { tryOr } from "#lib/error";

import type { SystemInfo } from "#__generated__/bindings";
import type { Sample } from "#components/chrono-graph";

export default function MemoryGraph(props: {
	systemInfo: SystemInfo | undefined;
}) {
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
			class="aspect-[2] w-full max-w-96 rounded-lg"
		/>
	);
}
