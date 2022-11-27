import { open } from "@tauri-apps/api/dialog";
import { createSignal } from "solid-js";

import { useFileDrop } from "~/hooks/file";

import { dragDropStyle, dragDropActiveStyle } from "./file-select.css";

import type { Component } from "solid-js";

const FileSelect: Component = () => {
	const [response, setResponse] = createSignal<string[]>();
	const [error, setError] = createSignal<Error>();
	const { files, isActive, elementHandles } = useFileDrop();

	const select = () => {
		void open({
			multiple: false,
			directory: true,
			recursive: false,
		})
			.then((selectedFiles) => {
				if (selectedFiles) {
					setResponse(
						Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles]
					);
				}
			})
			.catch((reason) => {
				setError(reason instanceof Error ? reason : new Error(String(reason)));
			});
	};

	return (
		<div>
			{error()?.message ?? null}
			<div>{response()?.join(", ")}</div>
			<button onClick={select}>Select</button>
			<div
				{...elementHandles}
				classList={{ [dragDropStyle]: true, [dragDropActiveStyle]: isActive() }}
			/>
			{files() ? <div>{JSON.stringify(files()?.at(0))}</div> : null}
		</div>
	);
};

export default FileSelect;
