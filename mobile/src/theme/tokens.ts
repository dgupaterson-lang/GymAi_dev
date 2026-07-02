/**
 * Tokens des deux palettes de la maquette GymAI.
 * Repris EXACTEMENT depuis `web/src/theme.ts` (mêmes valeurs), mais en
 * propriétés camelCase exploitables par React Native (pas de variables CSS,
 * pas de `linear-gradient(...)` string : les dégradés sont décrits par leurs
 * deux teintes `gradFrom`/`gradTo` pour expo-linear-gradient ou un fallback).
 *
 * NB : seule la « famille accent » (accent / accentGlow / accentDim / onAccent)
 * est remplacée à l'exécution par deriveAccent(couleurChoisie). Le reste vient
 * du mode de base (dark | rose).
 */

export type ThemeMode = 'dark' | 'rose';

export interface ThemeTokens {
  bg: string;
  surface: string;
  surface2: string;
  line: string;
  line2: string;
  txt: string;
  muted: string;
  muted2: string;
  /** famille accent — surchargée par deriveAccent() */
  accent: string;
  accentGlow: string;
  accentDim: string;
  onAccent: string;
  violet: string;
  violetDim: string;
  /** dégradé « hero » : du / vers */
  heroGradFrom: string;
  heroGradTo: string;
  /** fond de scène (radial dans la maquette) : centre / bord */
  stageBgFrom: string;
  stageBgTo: string;
  shell: string;
  island: string;
  ph1: string;
  ph2: string;
  ph3: string;
  good: string;
  warn: string;
  online: string;
  scrim: string;
  activeBg: string;
}

/** Palette Dark — valeurs identiques à web/src/theme.ts > themes.Dark. */
export const dark: ThemeTokens = {
  bg: '#080a10',
  surface: '#11151e',
  surface2: '#171c27',
  line: 'rgba(255,255,255,0.09)',
  line2: 'rgba(255,255,255,0.05)',
  txt: '#eef2f8',
  muted: '#8b93a4',
  muted2: '#5a6273',
  accent: '#5fe3f0',
  accentGlow: 'rgba(95,227,240,0.45)',
  accentDim: 'rgba(95,227,240,0.14)',
  onAccent: '#06222a',
  violet: '#9d8cff',
  violetDim: 'rgba(157,140,255,0.16)',
  heroGradFrom: '#13202b',
  heroGradTo: '#0e1620',
  stageBgFrom: '#0e1422',
  stageBgTo: '#06080d',
  shell: '#020306',
  island: '#000000',
  ph1: '#1a2230',
  ph2: '#161d29',
  ph3: '#131922',
  good: '#6ee7b7',
  warn: '#ffb86b',
  online: '#5ee9a0',
  scrim: 'rgba(8,10,16,0.7)',
  activeBg: '#0d1622',
};

/** Palette Rose — valeurs identiques à web/src/theme.ts > themes.Rose. */
export const rose: ThemeTokens = {
  bg: '#fbf5f7',
  surface: '#ffffff',
  surface2: '#fdeef3',
  line: 'rgba(60,18,38,0.10)',
  line2: 'rgba(60,18,38,0.06)',
  txt: '#2a1722',
  muted: '#8a7280',
  muted2: '#bda9b3',
  accent: '#f25d8e',
  accentGlow: 'rgba(242,93,142,0.38)',
  accentDim: 'rgba(242,93,142,0.12)',
  onAccent: '#ffffff',
  violet: '#c77dff',
  violetDim: 'rgba(199,125,255,0.16)',
  heroGradFrom: '#ffe3ec',
  heroGradTo: '#ffd4e4',
  stageBgFrom: '#ffe7ef',
  stageBgTo: '#f3dbe4',
  shell: '#ecd6df',
  island: '#1a1014',
  ph1: '#ffd9e5',
  ph2: '#ffe7ef',
  ph3: '#fff2f6',
  good: '#1faa6b',
  warn: '#e0852f',
  online: '#1faa6b',
  scrim: 'rgba(255,255,255,0.78)',
  activeBg: '#ffe1ec',
};

export const baseThemes: Record<ThemeMode, ThemeTokens> = { dark, rose };

/** Accent par défaut de chaque mode (cyan en dark, rose en rose). */
export const defaultAccent: Record<ThemeMode, string> = {
  dark: '#5fe3f0',
  rose: '#f25d8e',
};
