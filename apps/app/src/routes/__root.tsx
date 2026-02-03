import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import { createEffect, Show } from "solid-js";

import { usePrefersDark } from "#hooks/theme";

import type { ComponentProps, JSX } from "solid-js";

function RootLayout(): JSX.Element {
	const prefersDark = usePrefersDark();

	createEffect(() => {
		document.documentElement.classList.toggle("dark", prefersDark());
	});

	return (
		<>
			<div class="grid size-full grid-cols-[max-content_1fr]">
				<div class="min-h-full p-4 pe-8 pt-10 text-sm">
					<nav class="flex flex-col gap-2">
						<NavLink to="/">Home</NavLink>
						<NavLink to="/files">Files</NavLink>
						<NavLink to="/settings">Settings</NavLink>
					</nav>
				</div>
				<div class="h-full overflow-x-hidden overflow-y-auto">
					<Outlet />
					<Show when={import.meta.env.DEV}>
						<TanStackRouterDevtools />
						<SolidQueryDevtools />
					</Show>
				</div>
			</div>
			<div class="fixed inset-x-0 top-0 z-10 h-8" data-tauri-drag-region />
		</>
	);
}

export const Route = createRootRoute({ component: RootLayout });

function NavLink(
	props: Omit<ComponentProps<typeof Link>, "class" | "classList">,
) {
	return (
		<Link
			{...props}
			class="text-muted-foreground transition-colors hover:underline aria-[current=page]:text-foreground aria-[current=page]:hover:no-underline"
		/>
	);
}
