import { style } from "@vanilla-extract/css";

import { vars } from "~/style/theme";

export const dragDropStyle = style({
	blockSize: "200px",
	border: `1px solid ${vars.colors.keyline}`,
});

export const dragDropActiveStyle = style({
	borderColor: vars.colors.bodyText,
});
