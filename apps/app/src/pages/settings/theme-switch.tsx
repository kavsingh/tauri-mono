import { For, Match, Switch } from "solid-js";

import Card from "#components/card";
import {
	useSetThemePreferenceMutation,
	useThemePreferenceQuery,
} from "#hooks/theme";

import type { ThemePreference } from "#__generated__/bindings";

export const OPTIONS = [
	"System",
	"Dark",
	"Light",
] as const satisfies ThemePreference[];

export default function ThemeSwitch() {
	const prefQuery = useThemePreferenceQuery();
	const setPrefMutation = useSetThemePreferenceMutation();

	return (
		<Card.Root>
			<form
				onSubmit={(event) => {
					event.preventDefault();
				}}
			>
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
											checked={prefQuery.data === option}
											onChange={() => {
												setPrefMutation.mutate(option);
											}}
											class="peer cursor-pointer"
											disabled={prefQuery.isLoading}
										/>
										<label
											class="cursor-pointer text-muted-foreground transition-colors peer-checked:text-foreground"
											for={option}
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

function LabelText(props: { theme: ThemePreference }) {
	return (
		<Switch>
			<Match when={props.theme === "System"}>
				<>System</>
			</Match>
			<Match when={props.theme === "Light"}>
				<>Light</>
			</Match>
			<Match when={props.theme === "Dark"}>
				<>Dark</>
			</Match>
		</Switch>
	);
}
