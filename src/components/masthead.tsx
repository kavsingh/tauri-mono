import { A } from "@solidjs/router";

export default function Masthead() {
	return (
		<div class="flex items-center justify-between">
			<nav class="flex items-center gap-2">
				<A href="/">System Info</A>
				<A href="/files">Files</A>
			</nav>
		</div>
	);
}
