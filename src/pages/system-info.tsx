import { createResource, Show, For } from "solid-js";

import PageHeader from "~/components/page-header";
import { fetchSysInfo } from "~/services/sys-info";

import type { Component } from "solid-js";

const SystemInfo: Component = () => {
	const [sysInfo] = createResource(fetchSysInfo);

	return (
		<>
			<PageHeader>System Info</PageHeader>
			<ul class="m-0 flex list-none flex-col gap-2 p-0">
				<Show when={sysInfo()} fallback={<>Loading...</>} keyed>
					{(info) => (
						<For each={Object.entries(info)}>
							{([key, val]) => (
								<li class="flex gap-1 pbe-2 border-be border-be-100 last:pbe-0 last:border-be-0">
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
};

export default SystemInfo;