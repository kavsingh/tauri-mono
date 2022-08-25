import { globalStyle } from "@vanilla-extract/css";

globalStyle("html", {
	boxSizing: "border-box",
	fontSize: "16px",
});

globalStyle("*, *::before, *::after", {
	boxSizing: "inherit",
});

globalStyle("html, body", {
	margin: 0,
	padding: 0,
});

globalStyle("#app-root", {
	width: "100vw",
	height: "100vh",
});
