import { createResource, Show } from "solid-js";

import { fetchSysInfo } from "~/services/sys-info";

import type { Component } from "solid-js";

const SysInfo: Component = () => {
	const [sysInfo] = createResource(true, fetchSysInfo);

	return (
		<div>
			<Show when={sysInfo()} fallback={<>Loading...</>} keyed>
				{(info) => (
					<dl>
						{Object.entries(info).map(([key, val]) => (
							<>
								<dt>{key}</dt>
								<dd>{val}</dd>
							</>
						))}
					</dl>
				)}
			</Show>
		</div>
	);
};

export default SysInfo;
