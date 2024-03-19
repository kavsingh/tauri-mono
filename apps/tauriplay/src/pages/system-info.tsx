import { createResource, Show, For } from "solid-js";

import PageHeader from "#components/page-header";
import { fetchSysInfo } from "#services/sys-info";

export default function SystemInfo() {
	const [sysInfo] = createResource(fetchSysInfo);

	return (
		<>
			<PageHeader>System Info</PageHeader>
			<ul class="m-0 flex list-none flex-col gap-2 p-0">
				<Show when={sysInfo()} fallback={<>Loading...</>} keyed>
					{(info) => (
						<For each={Object.entries(info)}>
							{([key, val]) => (
								<li class="flex gap-1 border-b border-b-neutral-400 pb-2 last:border-b-0 last:pb-0 dark:border-b-neutral-700">
									<span class="after:content-[':']">{key}</span>
									<span>{val}</span>
								</li>
							)}
						</For>
					)}
				</Show>
			</ul>
		</>
	);
}
