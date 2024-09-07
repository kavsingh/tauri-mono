import { isRunAsScript, getFileLocation } from "./lib";

export function echoDirname() {
	console.log("__dirname: ", getFileLocation(import.meta.url).dirname);
}

if (isRunAsScript(import.meta.url)) echoDirname();
