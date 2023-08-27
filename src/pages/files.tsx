import { createEffect, createSignal, For } from "solid-js";
import { twMerge } from "tailwind-merge";

import Button from "ui:components/button";
import PageHeader from "ui:components/page-header";
import useFileDrop from "ui:hooks/use-file-drop";
import isErrorLike from "ui:lib/util/is-error-like";
import { selectFilesWithDialog } from "ui:services/files";

export default function Files() {
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
}

function DialogFileSelect(props: SelectProps) {
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
}

function DragFileSelect(props: SelectProps) {
	const [{ files, isActive }, dragDropHandlers] = useFileDrop();

	createEffect(() => {
		props.onSelect(files());
	});

	return (
		<div
			class={twMerge(
				"h-[200px] border border-neutral-500",
				isActive() && "border-current",
			)}
			{...dragDropHandlers}
		/>
	);
}

type SelectProps = { onSelect: (selected: string[]) => void };
