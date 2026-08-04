import { expect, $ } from "@wdio/globals";

describe("app", () => {
	it("should load at home route", async () => {
		await expect($("h2")).toBeExisting();
		await expect($("h2")).toHaveText(expect.stringContaining("Home"));
	});

	it("should navigate to settings", async () => {
		await $('a[href="/settings"]').click();
		await expect($("h2")).toHaveText(expect.stringContaining("Settings"));
	});
});
