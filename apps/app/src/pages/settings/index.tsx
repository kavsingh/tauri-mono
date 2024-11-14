import Page from "#layouts/page";

import ThemeSwitch from "./theme-switch";

export default function Settings() {
	return (
		<>
			<Page.Header>Settings</Page.Header>
			<Page.Content>
				<ThemeSwitch />
			</Page.Content>
		</>
	);
}
