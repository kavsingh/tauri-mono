import { createResource, Show, For } from "solid-js";

import { fetchSysInfo } from "~/services/sys-info";

import type { Component } from "solid-js";

const SysInfo: Component = () => {
	const [sysInfo] = createResource(fetchSysInfo);

	return (
		<dl>
			<Show when={sysInfo()} fallback={<>Loading...</>} keyed>
				{(info) => (
					<For each={Object.entries(info)}>
						{([key, val]) => (
							<>
								<dt>{key}</dt>
								<dd>{val}</dd>
							</>
						)}
					</For>
				)}
			</Show>
		</dl>
	);
};

export default SysInfo;
