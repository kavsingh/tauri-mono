import matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "solid-testing-library";
import { afterEach, expect } from "vitest";

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
	cleanup();
});

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Vi {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-definitions
		interface JestAssertion<T = any>
			extends jest.Matchers<void, T>,
				TestingLibraryMatchers<T, void> {}
	}
}
