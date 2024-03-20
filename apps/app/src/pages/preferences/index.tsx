import Page from "#layouts/page";

import ThemeSwitch from "./theme-switch";

export default function Preferences() {
	return (
		<>
			<Page.Header>Preferences</Page.Header>
			<Page.Content>
				<ThemeSwitch />
			</Page.Content>
		</>
	);
}
