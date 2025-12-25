import { useResizeObserver } from "#hooks/dom";
import { tryOr } from "#lib/error";
import { normalizeBigint } from "#lib/number";
import { tm } from "#lib/style";
import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import type { Accessor, JSX } from "solid-js";

// oxlint-disable-next-line max-statements
export function ChronoGraph(props: ChronoGraphProps): JSX.Element {
	const schemeQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
	const observeResize = useResizeObserver();
	let unobserveResize: ReturnType<typeof observeResize> | undefined = undefined;
	let canvasEl: HTMLCanvasElement | undefined = undefined;
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
			return [
				...current.slice(Math.max(current.length - (maxSamples - 1), 0)),
				sample,
			];
		});
	});

	function redraw() {
		if (canvasEl) drawGraph(canvasEl, normalizedValues());
	}

	createEffect(redraw);
	schemeQuery.addEventListener("change", redraw);

	onCleanup(() => {
		unobserveResize?.();
		schemeQuery.removeEventListener("change", redraw);
	});

	return (
		<canvas
			class={tm(
				"size-full border-accent-foreground bg-muted/30 text-muted/60",
				props.class,
			)}
			ref={(el) => {
				canvasEl = el;
				unobserveResize = observeResize(canvasEl, redraw);
			}}
		/>
	);
}

export interface ChronoGraphProps {
	sampleSource: Accessor<Sample | undefined>;
	minValue?: bigint | undefined;
	maxValue?: bigint | undefined;
	maxSamples?: number | undefined;
	class?: string | undefined;
}

export interface Sample {
	value: bigint;
}

// oxlint-disable-next-line max-statements
function drawGraph(canvas: HTMLCanvasElement, normalized: number[]) {
	const ctx = canvas.getContext("2d");

	if (!ctx) return;

	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const scale = devicePixelRatio;
	const canvasStyles = getComputedStyle(canvas);
	const step = width / Math.max(normalized.length - 1, 1);
	const gutter = 2;

	function getY(val: number) {
		return (1 - val) * height;
	}

	canvas.width = width * scale;
	canvas.height = height * scale;

	ctx.scale(scale, scale);
	ctx.clearRect(0, 0, width, height);

	ctx.fillStyle = canvasStyles.color;
	ctx.strokeStyle = canvasStyles.borderColor;

	ctx.beginPath();
	ctx.moveTo(-gutter, height + gutter);
	ctx.lineTo(-gutter, getY(normalized[0] ?? 1));

	for (let i = 0; i < normalized.length; i++) {
		ctx.lineTo(i * step, getY(normalized[i] ?? 0.5));
	}

	ctx.lineTo(width + gutter, getY(normalized.at(-1) ?? 0.5));
	ctx.lineTo(width + gutter, height + gutter);
	ctx.lineTo(width + gutter, height + gutter);
	ctx.moveTo(-gutter, height + gutter);
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
