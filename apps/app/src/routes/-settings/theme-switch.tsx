import { Effect } from "effect";
import { For, Match, Switch, createResource } from "solid-js";

import { Card } from "~/components/card";
import {
	setThemePreferenceEffect,
	themePreferenceEffect,
} from "~/services/tauri";

import type { JSX } from "solid-js";
import type { ThemePreference } from "~/tauri-bindings.gen";

const OPTIONS = [
	"System",
	"Dark",
	"Light",
] as const satisfies ThemePreference[];

function LabelText(props: { theme: ThemePreference }) {
	return (
		<Switch>
			<Match when={props.theme === "System"}>System</Match>
			<Match when={props.theme === "Light"}>Light</Match>
			<Match when={props.theme === "Dark"}>Dark</Match>
		</Switch>
	);
}

export function ThemeSwitch(): JSX.Element {
	const [preference, { refetch }] = createResource(() => {
		return Effect.runPromise(themePreferenceEffect());
	});

	async function handleChange(option: ThemePreference) {
		await Effect.runPromise(setThemePreferenceEffect(option));
		await refetch();
	}

	return (
		<Card.Root>
			<form onSubmit={(event) => event.preventDefault()}>
				<fieldset>
					<Card.Header>
						<Card.Title>
							<legend>Theme</legend>
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<ul class="flex gap-3">
							<For each={OPTIONS}>
								{(option) => (
									<li class="flex items-center gap-1">
										<input
											type="radio"
											id={option}
											name="theme-preference"
											value={option}
											checked={preference() === option}
											onChange={() => {
												void handleChange(option);
											}}
											class="peer cursor-pointer"
											disabled={preference.loading}
											aria-labelledby={`${option}-label`}
										/>
										<label
											class="cursor-pointer text-muted-foreground transition-colors peer-checked:text-foreground"
											for={option}
											id={`${option}-label`}
										>
											<LabelText theme={option} />
										</label>
									</li>
								)}
							</For>
						</ul>
					</Card.Content>
				</fieldset>
			</form>
		</Card.Root>
	);
}
