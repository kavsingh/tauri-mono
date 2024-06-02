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

		const maxSamples = props.maxSamples ?? 20;

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
	base: "size-full border-muted/60 bg-muted/30 text-accent-foreground",
});

function drawGraph(canvas: HTMLCanvasElement, normalized: number[]) {
	const ctx = canvas.getContext("2d");

	if (!ctx) return;

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const bleed = 2;
	const canvasStyles = getComputedStyle(canvas);
	const step = canvas.width / Math.max(normalized.length - 1, 1);
	const getY = (val: number) => (1 - val) * canvas.height;

	ctx.strokeStyle = canvasStyles.color;
	ctx.fillStyle = canvasStyles.borderColor;

	ctx.beginPath();
	ctx.moveTo(-bleed, canvas.height + bleed);
	ctx.lineTo(-bleed, getY(normalized[0] ?? 1));

	for (let i = 0; i < normalized.length; i++) {
		ctx.lineTo(i * step, getY(normalized[i] ?? 1));
	}

	ctx.lineTo(canvas.width + bleed, getY(normalized.at(-1) ?? 1));
	ctx.lineTo(canvas.width + bleed, canvas.height + bleed);
	ctx.lineTo(canvas.width + bleed, canvas.height + bleed);
	ctx.moveTo(-bleed, canvas.height + bleed);
	ctx.closePath();

	ctx.stroke();
	ctx.fill();
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
