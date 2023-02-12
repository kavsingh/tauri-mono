import { A } from "@solidjs/router";

import type { Component } from "solid-js";

const Masthead: Component = () => (
	<div class="flex items-center justify-between">
		<nav class="flex items-center gap-2">
			<A href="/">System Info</A>
			<A href="/files">Files</A>
		</nav>
	</div>
);

export default Masthead;
