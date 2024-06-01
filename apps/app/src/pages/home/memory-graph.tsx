import { createEffect, createSignal, onCleanup } from "solid-js";

import { divBigint } from "#lib/math";

import type { SystemInfo } from "#__generated__/bindings";

export default function MemoryGraph(props: {
	systemInfo: SystemInfo | undefined;
}) {
	const [samples, setSamples] = createSignal<Sample[]>([]);
	let canvasEl: HTMLCanvasElement | undefined;

	createEffect(() => {
		if (!props.systemInfo) return;

		const sample = toSample(props.systemInfo);

		setSamples((current) => {
			const next = current
				.slice(Math.max(current.length - 9, 0))
				.concat(sample);

			return next;
		});
	});

	createEffect(() => {
		if (canvasEl) drawGraph(canvasEl, samples());
	});

	function redraw() {
		if (canvasEl) drawGraph(canvasEl, samples());
	}

	const schemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

	window.addEventListener("resize", redraw);
	schemeQuery.addEventListener("change", redraw);

	onCleanup(() => {
		window.removeEventListener("resize", redraw);
		schemeQuery.removeEventListener("change", redraw);
	});

	return (
		<canvas
			class="size-full rounded bg-muted/30 text-foreground"
			ref={(el) => (canvasEl = el)}
		/>
	);
}

function drawGraph(canvas: HTMLCanvasElement, samples: Sample[]) {
	const ctx = canvas.getContext("2d");

	if (!ctx) return;

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const canvasStyles = getComputedStyle(canvas);
	const step = canvas.width / Math.max(samples.length - 1, 1);

	ctx.strokeStyle = canvasStyles.color;

	samples.forEach((sample, idx) => {
		const y = (1 - sample.value) * canvas.height;

		if (idx === 0) ctx.moveTo(0, y);
		else ctx.lineTo(idx * step, y);
	});

	ctx.stroke();
}

function toSample({ memAvailable, memTotal, sampledAt }: SystemInfo): Sample {
	const available = BigInt(memAvailable ?? 1);
	const total = BigInt(memTotal ?? 1);

	return { value: divBigint(available, total), timestamp: BigInt(sampledAt) };
}

type Sample = { value: number; timestamp: bigint };
