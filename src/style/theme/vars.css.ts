import { createThemeContract } from '@vanilla-extract/css';

export const vars = createThemeContract({
  fonts: {
    bodyText: null,
  },
  spacing: {
    fixed: { neutral: null, narrow: null, wide: null },
    relative: { neutral: null, narrow: null, wide: null },
  },
  colors: {
    bodyText: null,
    background: null,
    keyline: null,
  },
});
