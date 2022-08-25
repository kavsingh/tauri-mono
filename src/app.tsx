import { createSignal } from "solid-js";

import "./style/global-style.css";

import { uiRootStyle, dragDropStyle, dragDropActiveStyle } from "./app.css";
import { selectFiles } from "./bridge";
import { useFileDrop } from "./hooks/file";
import themeStore from "./style/theme-store";

import type { Component } from "solid-js";

const App: Component = () => {
	const [error, setError] = createSignal<Error>();
	const [response, setResponse] = createSignal<SelectedFiles>();
	const { files, isActive, elementHandles } = useFileDrop();

	const selectAudioFiles = () => {
		selectFiles()
			.then(setResponse)
			.catch((reason) =>
				setError(reason instanceof Error ? reason : new Error(String(reason)))
			);
	};

	return (
		<div classList={{ [themeStore.theme()]: true, [uiRootStyle]: true }}>
			{error()?.message ?? null}
			<div>{response()?.files.join(", ")}</div>
			<button onClick={selectAudioFiles}>Select</button>
			<div
				{...elementHandles}
				classList={{ [dragDropStyle]: true, [dragDropActiveStyle]: isActive() }}
			/>
			{files() ? <div>{JSON.stringify(files()?.at(0))}</div> : null}
		</div>
	);
};

export default App;

type SelectedFiles = Awaited<ReturnType<typeof selectFiles>>;
