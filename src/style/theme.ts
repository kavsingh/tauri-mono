export const theme = {
  name: 'light',
  fonts: {
    bodyText: 'system-ui, sans-serif',
  },
  colors: {
    bodyText: '#222',
    background: '#fefefe',
    keyline: '#dedede',
  },
};

export const defaultTheme: Theme = theme;

export type Theme = typeof theme;
