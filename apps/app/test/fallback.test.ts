import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

void test("the connection screen exposes retry after failure and reconnects", async () => {
	const source = await readFile(
		new URL("../fallback/main.js", import.meta.url),
		"utf8",
	);
	const status = { textContent: "" };
	const retry: {
		hidden: boolean;
		click: () => void;
		addEventListener: (event: string, listener: () => void) => void;
	} = {
		hidden: true,
		click: () => {},
		addEventListener(_event, listener) {
			this.click = listener;
		},
	};
	let attempts = 0;
	const context = {
		document: {
			querySelector: (selector: string) =>
				selector === "#status" ? status : retry,
		},
		window: {
			__TAURI_INTERNALS__: {
				invoke: () => {
					attempts += 1;
					return attempts === 1
						? Promise.reject(new Error("offline"))
						: Promise.resolve();
				},
			},
		},
		console: { error() {} },
	};

	vm.runInNewContext(source, context);
	await new Promise<void>((resolve) => {
		setImmediate(resolve);
	});
	assert.equal(retry.hidden, false);
	assert.match(status.textContent, /Could not load/);

	retry.click();
	assert.equal(retry.hidden, true);
	assert.match(status.textContent, /Connecting/);
	await new Promise<void>((resolve) => {
		setImmediate(resolve);
	});
	assert.equal(attempts, 2);
});
