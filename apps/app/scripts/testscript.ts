import { isRunAsScript } from "./lib.ts";

export function printFileLocation(): void {
	console.log(import.meta.dirname, import.meta.filename);
}

if (isRunAsScript(import.meta)) printFileLocation();
