import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export function isRunAsScript(importMetaUrl: string) {
	return (
		!!process.argv[1] && pathToFileURL(process.argv[1]).href === importMetaUrl
	);
}

export function getFileLocation(importMetaUrl: string) {
	const filename = fileURLToPath(importMetaUrl);
	const dirname = path.dirname(filename);

	return { filename, dirname } as const;
}
