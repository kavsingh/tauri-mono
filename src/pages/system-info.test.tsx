import { screen, render, waitFor } from "@solidjs/testing-library";
import { describe, it, expect, vitest } from "vitest";

import SystemInfo from "./system-info";

import type { SysInfoResponse } from "ui:__generated__/bindings/commands";

vitest.mock("ui:services/sys-info", () => {
	return {
		fetchSysInfo() {
			return Promise.resolve({
				name: "__SysInfo Name__",
				osVersion: "__SysInfo Os Version__",
				hostName: "__SysInfo Host Name__",
			} satisfies SysInfoResponse);
		},
	};
});

describe("<SystemInfo />", () => {
	it("should render system info", async () => {
		expect.assertions(4);

		render(() => <SystemInfo />);

		expect(screen.getByText("Loading..."))
			// @ts-expect-error sick of this shit TODO: fix
			.toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText("__SysInfo Name__"))
				// @ts-expect-error sick of this shit TODO: fix
				.toBeInTheDocument();
		});

		expect(screen.getByText("__SysInfo Os Version__"))
			// @ts-expect-error sick of this shit TODO: fix
			.toBeInTheDocument();
		expect(screen.getByText("__SysInfo Host Name__"))
			// @ts-expect-error sick of this shit TODO: fix
			.toBeInTheDocument();
	});
});
