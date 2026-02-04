import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { commands } from "shared/__generated__/tauri/bindings";
import { createEffect, createSignal, onCleanup } from "solid-js";

import { themePreferenceQuery } from "#lib/queries";
import { getStylePropertyValues } from "#lib/style";

import type { StyleProperyValueMap, StylePropertyValues } from "#lib/style";
import type { MutationOptions, UseMutationResult } from "@tanstack/solid-query";
import type { ThemePreference } from "shared/__generated__/tauri/bindings";
import type { Accessor } from "solid-js";

export function useSetThemePreferenceMutation(
	options?: Omit<
		MutationOptions<
			Awaited<ReturnType<typeof setThemePreference>>,
			Error,
			Parameters<typeof setThemePreference>[0]
		>,
		"mutationFn"
	>,
): UseMutationResult<void, Error, ThemePreference> {
	const queryKey = themePreferenceQuery().queryKey;
	const queryClient = useQueryClient();
	const { onSuccess, ...opts } = options ?? {};

	return useMutation(() => ({
		mutationFn: setThemePreference,
		onSuccess(...args) {
			onSuccess?.(...args);
			void queryClient.invalidateQueries({ queryKey });
		},
		...opts,
	}));
}

const darkSchemeQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");

export function usePrefersDark(): Accessor<boolean> {
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

export function useThemePropertyValues<TMap extends StyleProperyValueMap>(
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

function setThemePreference(theme: ThemePreference) {
	return commands.setThemePreference(theme);
}
