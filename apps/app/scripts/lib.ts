import { pathToFileURL } from "node:url";

export function isRunAsScript({ url }: ImportMeta): boolean {
	return !!process.argv[1] && pathToFileURL(process.argv[1]).href === url;
}
