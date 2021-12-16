import { createTheme } from '@vanilla-extract/css';

import { vars } from './vars.css';

export const dark = createTheme(vars, {
  fonts: {
    bodyText: 'system-ui, sans-serif',
  },
  spacing: {
    fixed: { neutral: '1rem', narrow: '0.4rem', wide: '2rem' },
    relative: { neutral: '1em', narrow: '0.4em', wide: '2em' },
  },
  colors: {
    bodyText: '#fefefe',
    background: '#222',
    keyline: '#666',
  },
});
