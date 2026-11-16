import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { createMockConnectionStatus } from "shared/test-helpers/tauri/mock-data/remote";
import { afterEach, describe, expect, it, vi } from "vitest";

import { commands } from "~/__test-helpers__/tauri/mock-bindings";
import { ConnectionBanner } from "~/components/connection-banner";

import type { PropsWithChildren } from "solid-js";

function Wrapper(props: PropsWithChildren) {
	return (
		<QueryClientProvider client={new QueryClient()}>
			{props.children}
		</QueryClientProvider>
	);
}

describe("<ConnectionBanner />", () => {
	afterEach(() => {
		cleanup();
		vi.resetAllMocks();
	});

	it("shows the local warning and reports a failed remote retry", async () => {
		vi.mocked(commands.getConnectionStatus).mockResolvedValue(
			createMockConnectionStatus({ mode: "local" }),
		);
		vi.mocked(commands.connectRemote).mockRejectedValue(
			new Error("Remote frontend is unavailable"),
		);

		render(() => <ConnectionBanner />, { wrapper: Wrapper });

		const button = await screen.findByRole("button", { name: "Retry remote" });
		expect(
			screen.getByText("Using a local copy. It may be out of date."),
		).toBeInTheDocument();

		button.click();

		await waitFor(() => {
			expect(
				screen.getByText("Error: Remote frontend is unavailable"),
			).toBeInTheDocument();
		});
		expect(screen.getByRole("button", { name: "Retry remote" })).toBeEnabled();
	});

	it("keeps the local app available while retrying the remote frontend", async () => {
		vi.mocked(commands.getConnectionStatus).mockResolvedValue(
			createMockConnectionStatus({ mode: "local" }),
		);
		const retry =
			Promise.withResolvers<
				Awaited<ReturnType<typeof commands.connectRemote>>
			>();
		vi.mocked(commands.connectRemote).mockReturnValue(retry.promise);

		render(() => <ConnectionBanner />, { wrapper: Wrapper });

		(await screen.findByRole("button", { name: "Retry remote" })).click();

		expect(screen.getByRole("button", { name: "Retrying..." })).toBeDisabled();
		expect(
			screen.getByText("Using a local copy. It may be out of date."),
		).toBeInTheDocument();

		retry.resolve(null);
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: "Retry remote" }),
			).toBeEnabled();
		});
		await waitFor(() => {
			expect(commands.getConnectionStatus).toHaveBeenCalledTimes(2);
		});
	});

	it("updates the banner when a successful retry switches to remote mode", async () => {
		vi.mocked(commands.getConnectionStatus)
			.mockResolvedValueOnce(createMockConnectionStatus({ mode: "local" }))
			.mockResolvedValue(createMockConnectionStatus({ mode: "remote" }));
		vi.mocked(commands.connectRemote).mockResolvedValue(null);

		render(() => <ConnectionBanner />, { wrapper: Wrapper });

		(await screen.findByRole("button", { name: "Retry remote" })).click();

		await waitFor(() => {
			expect(commands.getConnectionStatus).toHaveBeenCalledTimes(2);
			expect(
				screen.queryByText("Using a local copy. It may be out of date."),
			).not.toBeInTheDocument();
		});
	});

	it("does not show a warning in remote mode", async () => {
		vi.mocked(commands.getConnectionStatus).mockResolvedValue(
			createMockConnectionStatus({ mode: "remote" }),
		);
		const client = new QueryClient();

		render(() => (
			<QueryClientProvider client={client}>
				<ConnectionBanner />
			</QueryClientProvider>
		));

		await waitFor(() => {
			expect(client.getQueryState(["connectionStatus"])?.status).toBe(
				"success",
			);
		});
		expect(
			screen.queryByRole("button", { name: "Retry remote" }),
		).not.toBeInTheDocument();
	});

	it("reports a connection status error", async () => {
		vi.mocked(commands.getConnectionStatus).mockRejectedValue(
			new Error("not allowed. Plugin not found"),
		);

		render(() => <ConnectionBanner />, { wrapper: Wrapper });

		expect(
			await screen.findByText(
				"Could not determine connection mode: Error: not allowed. Plugin not found",
			),
		).toBeInTheDocument();
	});
});
