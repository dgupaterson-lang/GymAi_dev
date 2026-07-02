export { ThemeProvider, useTheme } from './ThemeProvider';
export type { ComputedTheme } from './ThemeProvider';
export { useThemeStore } from './store';
export type { ThemeState } from './store';
export { deriveAccent, hexToRgb, relativeLuminance, darkTint } from './deriveAccent';
export type { AccentFamily } from './deriveAccent';
export { baseThemes, dark, rose, defaultAccent } from './tokens';
export type { ThemeMode, ThemeTokens } from './tokens';

/** Swatches préréglés proposés dans le color picker. */
export const PRESET_SWATCHES: { name: string; hex: string }[] = [
  { name: 'Cyan', hex: '#5fe3f0' },
  { name: 'Violet', hex: '#9d8cff' },
  { name: 'Rose', hex: '#f25d8e' },
  { name: 'Vert', hex: '#5ee9a0' },
  { name: 'Orange', hex: '#ffb86b' },
];
