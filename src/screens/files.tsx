import { createEffect, createSignal, For } from "solid-js";

import useFileDrop from "~/hooks/use-file-drop";
import isErrorLike from "~/lib/util/is-error-like";
import { selectFilesWithDialog } from "~/services/files";

import type { Component } from "solid-js";

const Files: Component = () => {
	const [selectedFiles, setSelectedFiles] = createSignal<string[]>([]);

	function handleFileSelect(selected: string[]) {
		setSelectedFiles((current) => current.concat(selected));
	}

	return (
		<div>
			<DialogFileSelect onSelect={handleFileSelect} />
			<DragFileSelect onSelect={handleFileSelect} />
			<ul>
				<For each={selectedFiles()}>{(file) => <li>{file}</li>}</For>
			</ul>
		</div>
	);
};

export default Files;

const DialogFileSelect: Component<{
	onSelect: (selected: string[]) => void;
}> = (props) => {
	const [errorMessage, setErrorMessage] = createSignal<string>();

	function selectFiles() {
		void selectFilesWithDialog()
			.then(props.onSelect)
			.catch((reason) => {
				setErrorMessage(isErrorLike(reason) ? reason.message : String(reason));
			});
	}

	return (
		<>
			<button onClick={selectFiles}>Select files</button>
			{errorMessage() ?? null}
		</>
	);
};

const DragFileSelect: Component<{
	onSelect: (selected: string[]) => void;
}> = (props) => {
	const { files, isActive, elementHandles } = useFileDrop();

	createEffect(() =>
		props.onSelect(files()?.map(({ file }) => file.name) ?? [])
	);

	return (
		<div
			{...elementHandles}
			class="border-current/60 bs-[200px]"
			classList={{ "border-current/100": isActive() }}
		/>
	);
};
