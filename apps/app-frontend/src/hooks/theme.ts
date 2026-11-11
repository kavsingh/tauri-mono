import { createEffect, createSignal, onCleanup } from "solid-js";

import { getStylePropertyValues } from "~/lib/style";

import type { Accessor } from "solid-js";
import type { StyleProperyValueMap, StylePropertyValues } from "~/lib/style";

const darkSchemeQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");

function usePrefersDark(): Accessor<boolean> {
	const [prefersDarkScheme, setPrefersDarkScheme] = createSignal(
		darkSchemeQuery.matches,
	);

	function onChange() {
		setPrefersDarkScheme(darkSchemeQuery.matches);
	}

	darkSchemeQuery.addEventListener("change", onChange);

	onCleanup(() => {
		darkSchemeQuery.removeEventListener("change", onChange);
	});

	return prefersDarkScheme;
}

function useThemePropertyValues<TMap extends StyleProperyValueMap>(
	valueMap: TMap,
): Accessor<StylePropertyValues<TMap>> {
	const prefersDark = usePrefersDark();
	const [values, setValues] = createSignal(getStylePropertyValues(valueMap));

	createEffect(() => {
		prefersDark();
		setValues(() => getStylePropertyValues(valueMap));
	});

	return values;
}

export { usePrefersDark, useThemePropertyValues };
