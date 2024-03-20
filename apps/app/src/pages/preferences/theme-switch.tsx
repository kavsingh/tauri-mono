import { For, Match, Switch } from "solid-js";

import useTheme from "#hooks/use-theme";

const THEMES = ["dark", "light"] as const;

export default function ThemeSwitch() {
	const theme = useTheme();

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
			}}
		>
			<fieldset>
				<legend class="mb-2 font-semibold">Theme</legend>
				<ul class="flex gap-3">
					<For each={THEMES}>
						{(option) => (
							<li class="flex items-center gap-1">
								<input
									type="radio"
									id={option}
									name={option}
									value={option}
									checked={theme() === option}
									class="peer size-4 cursor-pointer"
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

function LabelText(props: { theme: "dark" | "light" }) {
	return (
		<Switch>
			<Match when={props.theme === "light"}>
				<>Light</>
			</Match>
			<Match when={props.theme === "dark"}>
				<>Dark</>
			</Match>
		</Switch>
	);
}
