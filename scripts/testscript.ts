import { isCli, toDirname } from "./lib.js";

export function echoDirname() {
	console.log("__dirname: ", toDirname(import.meta.url));
}

if (isCli(import.meta.url)) echoDirname();
