import { invoke } from "@tauri-apps/api";

// theme api needs some manual work
// https://github.com/wyhaya/tauri-plugin-theme/tree/tauri-v1?tab=readme-ov-file#usage

export async function getSystemTheme() {
	const theme = await invoke("plugin:theme|get_theme");

	return isSystemTheme(theme) ? theme : "auto";
}

export function setSystemTheme(theme: SystemTheme): Promise<void> {
	return invoke("plugin:theme|set_theme", { theme });
}

export function isSystemTheme(value: unknown): value is SystemTheme {
	return SYSTEM_THEMES.includes(value as SystemTheme);
}

export const SYSTEM_THEMES = ["auto", "light", "dark"] as const;

export type SystemTheme = (typeof SYSTEM_THEMES)[number];
