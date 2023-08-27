import { A } from "@solidjs/router";
import { createSignal, onCleanup } from "solid-js";

import { subscribeWindow } from "ui:bridge/subscribe";

import Pulse from "./pulse";
import StatusBadge from "./status-badge";

export default function Masthead() {
	const [message, setMessage] = createSignal("");
	const [timestamp, setTimestamp] = createSignal("");
	const unsubscribe = subscribeWindow("heartbeat", ({ payload }) => {
		setMessage(payload.message);
		setTimestamp(payload.timestamp.toString());
	});

	onCleanup(unsubscribe);

	return (
		<div class="flex items-center justify-between">
			<nav class="flex items-center gap-2">
				<A href="/">System Info</A>
				<A href="/files">Files</A>
			</nav>
			<Pulse trigger={timestamp}>
				<StatusBadge>{message()}</StatusBadge>
			</Pulse>
		</div>
	);
}
