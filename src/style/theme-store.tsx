import { createSignal } from "solid-js";

import { defaultTheme, themes } from "./theme";

const autoSwitchableThemes = [themes.dark, themes.light];

const prefersDarkQuery =
	typeof window !== "undefined"
		? window.matchMedia("(prefers-color-scheme: dark)")
		: null;

const getPreferredTheme = (isDark: boolean) =>
	isDark ? themes.dark : themes.light;

const [theme, setTheme] = createSignal(
	prefersDarkQuery ? getPreferredTheme(prefersDarkQuery.matches) : defaultTheme
);

export default { theme, setTheme } as const;

prefersDarkQuery?.addEventListener("change", ({ matches }) => {
	setTheme((current) =>
		autoSwitchableThemes.includes(current)
			? getPreferredTheme(matches)
			: current
	);
});
