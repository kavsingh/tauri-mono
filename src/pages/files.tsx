import { createEffect, createSignal, For } from "solid-js";

import Button from "~/components/button";
import PageHeader from "~/components/page-header";
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
		<>
			<PageHeader>Files</PageHeader>
			<DialogFileSelect onSelect={handleFileSelect} />
			<DragFileSelect onSelect={handleFileSelect} />
			<ul>
				<For each={selectedFiles()}>{(file) => <li>{file}</li>}</For>
			</ul>
		</>
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
			<Button onClick={selectFiles}>Select files</Button>
			{errorMessage() ?? null}
		</>
	);
};

const DragFileSelect: Component<{
	onSelect: (selected: string[]) => void;
}> = (props) => {
	const [{ files, isActive }, dragDropHandlers] = useFileDrop();

	createEffect(() => props.onSelect(files()));

	return (
		<div
			class="border border-100 bs-[200px]"
			classList={{ "border-current": isActive() }}
			{...dragDropHandlers}
		/>
	);
};
