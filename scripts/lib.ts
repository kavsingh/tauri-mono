import { fileURLToPath, pathToFileURL } from "url";

export function toDirname(importUrl: string) {
	return fileURLToPath(new URL(".", importUrl));
}

export function isCli(importUrl: string) {
	return !!process.argv[1] && pathToFileURL(process.argv[1]).href === importUrl;
}
