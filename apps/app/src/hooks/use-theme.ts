import { createSignal, onCleanup } from "solid-js";

export default function useTheme() {
	const [theme, setTheme] = createSignal<UiTheme>(getQueryTheme());

	function handleQuery() {
		setTheme(getQueryTheme());
	}

	lightSchemeQuery.addEventListener("change", handleQuery);
	darkSchemeQuery.addEventListener("change", handleQuery);

	onCleanup(() => {
		lightSchemeQuery.removeEventListener("change", handleQuery);
		darkSchemeQuery.removeEventListener("change", handleQuery);
	});

	return theme;
}

export type UiTheme = "dark" | "light";

function getQueryTheme(): UiTheme {
	if (darkSchemeQuery.matches) return "dark";

	return "light";
}

const darkSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const lightSchemeQuery = window.matchMedia("(prefers-color-scheme: light)");
