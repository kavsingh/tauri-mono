import { createResource, Show, For } from "solid-js";

import { fetchSysInfo } from "~/services/sys-info";

import type { Component } from "solid-js";

const SysInfo: Component = () => {
	const [sysInfo] = createResource(true, fetchSysInfo);

	return (
		<div>
			<Show when={sysInfo()} fallback={<>Loading...</>} keyed>
				{(info) => (
					<dl>
						<For each={Object.entries(info)}>
							{([key, val]) => (
								<>
									<dt>{key}</dt>
									<dd>{val}</dd>
								</>
							)}
						</For>
					</dl>
				)}
			</Show>
		</div>
	);
};

export default SysInfo;
