import { Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { userEvent } from "@testing-library/user-event";

import type { ParentProps } from "solid-js";

export function setupRenderWrapper() {
	const queryClient = new QueryClient();
	const user = userEvent.setup();

	function Wrapper(props: ParentProps) {
		return (
			<QueryClientProvider client={queryClient}>
				<Router>{props.children}</Router>
			</QueryClientProvider>
		);
	}

	return { user, queryClient, Wrapper } as const;
}
