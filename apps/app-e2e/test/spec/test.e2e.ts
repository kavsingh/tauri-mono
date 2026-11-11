/// <reference lib="dom" />

import { expect, $, browser } from "@wdio/globals";

async function waitForPreference(preference: string) {
	await browser.waitUntil(async () => {
		const value = await browser.execute(
			'return window.__TAURI_INTERNALS__.invoke("get_theme_preference")',
		);
		return value === preference;
	});
}

describe("app", () => {
	it("should load at home route", async () => {
		await expect($("h2=Home")).toBeExisting();
	});

	it("should navigate to settings", async () => {
		await $("a=Settings").click();
		await expect($("h2=Settings")).toBeExisting();
	});

	it("should apply theme preferences to the remote webview", async () => {
		await $("a=Settings").click();
		const system = $("#System");
		const dark = $("#Dark");
		const light = $("#Light");

		await system.waitForEnabled();
		await browser.waitUntil(async () => {
			return (
				(await system.isSelected()) ||
				(await dark.isSelected()) ||
				(await light.isSelected())
			);
		});

		const original = (await dark.isSelected())
			? "Dark"
			: (await light.isSelected())
				? "Light"
				: "System";

		try {
			await dark.click();
			await waitForPreference("Dark");
			await expect(dark).toBeSelected();
			await browser.waitUntil(() =>
				browser.execute(() => {
					return (
						matchMedia("(prefers-color-scheme: dark)").matches &&
						document.documentElement.classList.contains("dark")
					);
				}),
			);

			await light.click();
			await waitForPreference("Light");
			await expect(light).toBeSelected();
			await browser.waitUntil(() =>
				browser.execute(() => {
					return (
						!matchMedia("(prefers-color-scheme: dark)").matches &&
						!document.documentElement.classList.contains("dark")
					);
				}),
			);
		} finally {
			await $(`#${original}`).click();
			await waitForPreference(original);
		}
	});
});
