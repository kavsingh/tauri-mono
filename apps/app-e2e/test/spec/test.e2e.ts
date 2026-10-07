import { expect, $ } from "@wdio/globals";

describe("app", () => {
	it("should load at home route", async () => {
		await expect($("h2=Home")).toBeExisting();
	});

	it("should navigate to settings", async () => {
		await $("a=Settings").click();
		await expect($("h2=Settings")).toBeExisting();
	});
});
