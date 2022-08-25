import { style } from "@vanilla-extract/css";

import { vars } from "./style/theme";

export const uiRootStyle = style({
	minBlockSize: "100%",
	padding: "1em",
	color: vars.colors.bodyText,
	fontFamily: vars.fonts.bodyText,
	backgroundColor: vars.colors.background,
});

export const dragDropStyle = style({
	blockSize: "200px",
	border: `1px solid ${vars.colors.keyline}`,
});

export const dragDropActiveStyle = style({
	borderColor: vars.colors.bodyText,
});
