import { isRunAsScript, getFileLocation } from "./lib.ts";

export function printFileLocation() {
	console.log(getFileLocation(import.meta));
}

if (isRunAsScript(import.meta)) printFileLocation();
