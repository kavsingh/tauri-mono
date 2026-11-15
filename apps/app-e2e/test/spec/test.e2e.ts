import { setTimeout } from "node:timers/promises";

describe("app", () => {
	it("should load at home route", async () => {
		await expect($("h2=Home")).toBeExisting();
	});

	it("should navigate to settings", async () => {
		await $("a=Settings").click();
		await expect($("h2=Settings")).toBeExisting();
	});

	it("should apply theme preferences to the frontend", async () => {
		await $("a=Settings").click();
		const dark = await $("input[value='Dark']");
		const light = await $("input[value='Light']");
		const [darkSelected, lightSelected] = await Promise.all([
			dark.isSelected(),
			light.isSelected(),
		]);

		const original = darkSelected ? "Dark" : lightSelected ? "Light" : "System";

		try {
			await dark.click();
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
			await $(`input[value='${original}']`).click();
			// allow the preference to apply before teardown
			await setTimeout(600);
		}
	});
});
