import { For, Match, Switch, createMemo } from "solid-js";

import useSystemTheme from "#hooks/use-system-theme";
import { SYSTEM_THEMES } from "#services/system-theme";

import type { SystemTheme } from "#services/system-theme";

export default function ThemeSwitch() {
	const [query, { mutate: setTheme }] = useSystemTheme();
	const theme = createMemo<SystemTheme>(() => query.data ?? "auto");

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
			}}
		>
			<fieldset>
				<legend class="mb-2 font-semibold">Theme</legend>
				<ul class="flex gap-3">
					<For each={Object.values(SYSTEM_THEMES)}>
						{(option) => (
							<li class="flex items-center gap-1">
								<input
									type="radio"
									id={option}
									name={option}
									value={option}
									checked={theme() === option}
									onChange={() => {
										setTheme(option);
									}}
									class="peer cursor-pointer"
									disabled={query.isLoading}
								/>
								<label
									class="cursor-pointer text-neutral-500 transition-colors peer-checked:text-black dark:peer-checked:text-white"
									for={option}
								>
									<LabelText theme={option} />
								</label>
							</li>
						)}
					</For>
				</ul>
			</fieldset>
		</form>
	);
}

function LabelText(props: { theme: SystemTheme }) {
	return (
		<Switch>
			<Match when={props.theme === "auto"}>
				<>System</>
			</Match>
			<Match when={props.theme === "light"}>
				<>Light</>
			</Match>
			<Match when={props.theme === "dark"}>
				<>Dark</>
			</Match>
		</Switch>
	);
}
