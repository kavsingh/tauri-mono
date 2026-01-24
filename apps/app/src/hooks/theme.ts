import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createEffect, createSignal, onCleanup } from "solid-js";

import { commands } from "#__generated__/bindings";
import { getStylePropertyValues } from "#lib/style";

import type { ThemePreference } from "#__generated__/bindings";
import type { StyleProperyValueMap, StylePropertyValues } from "#lib/style";
import type {
	MutationOptions,
	UseMutationResult,
	UseQueryResult,
} from "@tanstack/solid-query";
import type { Accessor } from "solid-js";

export function useThemePreferenceQuery(): UseQueryResult<ThemePreference> {
	return useQuery(() => ({
		queryKey: ["themePreference"],
		queryFn: () => commands.getThemePreference(),
	}));
}

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
	const queryClient = useQueryClient();
	const { onSuccess, ...opts } = options ?? {};

	return useMutation(() => ({
		mutationFn: setThemePreference,
		onSuccess(...args) {
			onSuccess?.(...args);
			void queryClient.invalidateQueries({ queryKey: ["themePreference"] });
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
