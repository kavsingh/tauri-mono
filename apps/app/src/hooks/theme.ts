import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createSignal, onCleanup } from "solid-js";

import { commands } from "#__generated__/bindings";

import type { ThemePreference } from "#__generated__/bindings";
import type { MutationOptions } from "@tanstack/solid-query";

export function useThemePreferenceQuery() {
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
) {
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

const darkSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

export function usePrefersDark() {
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

function setThemePreference(theme: ThemePreference) {
	return commands.setThemePreference(theme);
}
