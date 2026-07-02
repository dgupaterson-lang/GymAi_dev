import React, { createContext, useContext, useMemo } from 'react';
import { deriveAccent } from './deriveAccent';
import { useThemeStore } from './store';
import { baseThemes, type ThemeMode, type ThemeTokens } from './tokens';

/**
 * Thème calculé exposé à l'app : tokens du mode de base courant dont la
 * « famille accent » (accent / accentGlow / accentDim / onAccent) est REMPLACÉE
 * par deriveAccent(accentChoisi).
 */
export interface ComputedTheme {
  mode: ThemeMode;
  accent: string;
  /** tokens prêts à consommer dans les styles */
  c: ThemeTokens;
  setMode: (mode: ThemeMode) => void;
  setModeWithDefaultAccent: (mode: ThemeMode) => void;
  setAccent: (accent: string) => void;
}

const ThemeContext = createContext<ComputedTheme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);
  const setMode = useThemeStore((s) => s.setMode);
  const setModeWithDefaultAccent = useThemeStore((s) => s.setModeWithDefaultAccent);
  const setAccent = useThemeStore((s) => s.setAccent);

  const value = useMemo<ComputedTheme>(() => {
    const base = baseThemes[mode];
    const fam = deriveAccent(accent);
    const c: ThemeTokens = {
      ...base,
      accent: fam.accent,
      accentGlow: fam.accentGlow,
      accentDim: fam.accentDim,
      onAccent: fam.onAccent,
    };
    return { mode, accent, c, setMode, setModeWithDefaultAccent, setAccent };
  }, [mode, accent, setMode, setModeWithDefaultAccent, setAccent]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Hook principal : accès aux couleurs courantes + setters. */
export function useTheme(): ComputedTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>.');
  return ctx;
}
