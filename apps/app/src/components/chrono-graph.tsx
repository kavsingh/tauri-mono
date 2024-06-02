import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { tv } from "tailwind-variants";

import { tryOr } from "#lib/error";
import { normalizeBigint } from "#lib/number";

import type { Accessor } from "solid-js";
import type { VariantProps } from "tailwind-variants";

export default function ChronoGraph(
	props: {
		sampleSource: Accessor<Sample | undefined>;
		minValue?: bigint | undefined;
		maxValue?: bigint | undefined;
		maxSamples?: number | undefined;
		class?: string | undefined;
	} & VariantProps<typeof chronoGraphVariants>,
) {
	let canvasEl: HTMLCanvasElement | undefined;
	let rollingMin = 0n;
	let rollingMax = 0n;

	const [samples, setSamples] = createSignal<Sample[]>([]);
	const normalizedValues = createMemo(() => {
		return normalizeValues(
			samples(),
			props.minValue ?? rollingMin,
			props.maxValue ?? rollingMax,
		);
	});

	createEffect(() => {
		const sample = props.sampleSource();

		if (!sample) return;

		if (sample.value < rollingMin) rollingMin = sample.value;
		else if (sample.value > rollingMax) rollingMax = sample.value;

		const maxSamples = props.maxSamples ?? 10;

		setSamples((current) => {
			return current
				.slice(Math.max(current.length - (maxSamples - 1), 0))
				.concat(sample);
		});
	});

	createEffect(() => {
		if (canvasEl) drawGraph(canvasEl, normalizedValues());
	});

	function redraw() {
		if (canvasEl) drawGraph(canvasEl, normalizedValues());
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
			class={chronoGraphVariants({ class: props.class })}
			ref={(el) => (canvasEl = el)}
		/>
	);
}

export type Sample = { value: bigint };

const chronoGraphVariants = tv({
	base: "size-full bg-muted/30 text-accent-foreground",
});

function drawGraph(canvas: HTMLCanvasElement, normalized: number[]) {
	const ctx = canvas.getContext("2d");

	if (!ctx) return;

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const canvasStyles = getComputedStyle(canvas);
	const step = canvas.width / Math.max(normalized.length - 1, 1);

	ctx.strokeStyle = canvasStyles.color;

	for (let i = 0; i < normalized.length; i++) {
		const y = (1 - (normalized[i] ?? 1)) * canvas.height;

		if (i === 0) ctx.moveTo(0, y);
		else ctx.lineTo(i * step, y);
	}

	ctx.stroke();
}

function normalizeValues(
	samples: Sample[],
	min: bigint,
	max: bigint,
): number[] {
	return samples.map(({ value }) => {
		return tryOr(() => normalizeBigint(value, min, max), 0.5);
	});
}
