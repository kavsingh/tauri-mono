import { isCli, toDirname } from "./lib";

export function echoDirname() {
	console.log("__dirname: ", toDirname(import.meta.url));
}

if (isCli(import.meta.url)) echoDirname();
