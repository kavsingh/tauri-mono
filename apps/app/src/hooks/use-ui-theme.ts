import { createSignal, onCleanup } from "solid-js";

export default function useUiTheme() {
	const [theme, setTheme] = createSignal<UiTheme>(getQueryTheme());

	function handleQuery() {
		setTheme(getQueryTheme());
	}

	darkSchemeQuery.addEventListener("change", handleQuery);

	onCleanup(() => {
		darkSchemeQuery.removeEventListener("change", handleQuery);
	});

	return theme;
}

export type UiTheme = "dark" | "light";

function getQueryTheme(): UiTheme {
	return darkSchemeQuery.matches ? "dark" : "light";
}

const darkSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
