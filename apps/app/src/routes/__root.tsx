import { TanStackDevtools } from "@tanstack/solid-devtools";
import { SolidQueryDevtoolsPanel } from "@tanstack/solid-query-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/solid-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/solid-router-devtools";
import { createEffect, Show, splitProps } from "solid-js";

import { usePrefersDark } from "~/hooks/theme";

import type { ComponentProps, JSX } from "solid-js";

function NavLink(
	_props: Omit<ComponentProps<typeof Link>, "class" | "classList">,
) {
	const [props, passProps] = splitProps(_props, ["children"]);

	return (
		<Link
			{...passProps}
			class="text-muted-foreground transition-colors hover:underline aria-[current=page]:text-foreground aria-[current=page]:hover:no-underline"
		>
			{props.children}
		</Link>
	);
}

function RootLayout(): JSX.Element {
	const prefersDark = usePrefersDark();

	createEffect(() => {
		document.documentElement.classList.toggle("dark", prefersDark());
	});

	return (
		<>
			<div class="grid size-full grid-cols-[max-content_1fr]">
				<div class="min-h-full p-4 pe-8 pbs-10 text-sm">
					<nav class="flex flex-col gap-2">
						<NavLink to="/">Home</NavLink>
						<NavLink to="/files">Files</NavLink>
						<NavLink to="/settings">Settings</NavLink>
					</nav>
				</div>
				<div class="h-full overflow-x-hidden overflow-y-auto">
					<Outlet />
					<Show when={import.meta.env.DEV}>
						<TanStackDevtools
							plugins={[
								{
									name: "TanStack Query",
									render: <SolidQueryDevtoolsPanel />,
									defaultOpen: true,
								},
								{
									name: "TanStack Router",
									render: <TanStackRouterDevtoolsPanel />,
									defaultOpen: false,
								},
							]}
						/>
					</Show>
				</div>
			</div>
			<div class="fixed inset-x-0 inset-bs-0 z-10 h-8" data-tauri-drag-region />
		</>
	);
}

export const Route = createRootRoute({ component: RootLayout });
