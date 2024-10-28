import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export function isRunAsScript({ url }: ImportMeta) {
	return !!process.argv[1] && pathToFileURL(process.argv[1]).href === url;
}

export function getFileLocation({ url }: ImportMeta) {
	const filename = fileURLToPath(url);

	return { filename, dirname: path.dirname(filename) } as const;
}
