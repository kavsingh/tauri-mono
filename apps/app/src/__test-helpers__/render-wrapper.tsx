import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { userEvent } from "@testing-library/user-event";

import type { UserEvent } from "@testing-library/user-event";
import type { JSX, ParentProps } from "solid-js";

export function setupRenderWrapper(): {
	user: UserEvent;
	queryClient: QueryClient;
	Wrapper: (props: ParentProps) => JSX.Element;
} {
	const queryClient = new QueryClient();
	const user = userEvent.setup();

	function Wrapper(props: ParentProps) {
		return (
			<QueryClientProvider client={queryClient}>
				<Router>
					<Route path="/" component={() => props.children} />
				</Router>
			</QueryClientProvider>
		);
	}

	return { user, queryClient, Wrapper };
}
