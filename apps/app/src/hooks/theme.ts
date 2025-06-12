import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createSignal, onCleanup } from "solid-js";

import type { MutationOptions } from "@tanstack/solid-query";

export function useThemePreferenceQuery() {
	return useQuery(() => ({
		queryKey: ["themePreference"],
		queryFn: getThemePreference,
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

export const THEME_PREFERENCES = ["system", "dark", "light"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

async function getThemePreference(): Promise<ThemePreference> {
	const theme = await getCurrentWindow().theme();

	return theme ?? "system";
}

function setThemePreference(theme: ThemePreference) {
	return getCurrentWindow().setTheme(theme === "system" ? null : theme);
}
