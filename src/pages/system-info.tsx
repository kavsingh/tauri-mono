import { createResource, Show, For } from "solid-js";

import PageHeader from "ui:components/page-header";
import { fetchSysInfo } from "ui:services/sys-info";

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
								<li class="flex gap-1 pbe-2 border-be border-be-accent100 last:pbe-0 last:border-be-0">
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
