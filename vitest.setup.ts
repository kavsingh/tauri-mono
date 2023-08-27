import "@testing-library/jest-dom/vitest";
import { cleanup } from "solid-testing-library";
import { afterEach } from "vitest";

afterEach(() => {
	cleanup();
});
