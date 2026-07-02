import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { defaultAccent, type ThemeMode } from './tokens';

/**
 * État de thème = { mode, accent }.
 * - mode : 'dark' | 'rose' (mode de base : fond / surfaces / texte)
 * - accent : couleur d'accent LIBRE (hex). Dérivée à l'affichage par deriveAccent().
 * Persisté via AsyncStorage (le choix survit aux redémarrages).
 */
export interface ThemeState {
  mode: ThemeMode;
  accent: string;
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: string) => void;
  /** Bascule de mode + réinitialise l'accent à celui par défaut du mode. */
  setModeWithDefaultAccent: (mode: ThemeMode) => void;
  reset: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      accent: defaultAccent.dark,
      hydrated: false,
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      setModeWithDefaultAccent: (mode) => set({ mode, accent: defaultAccent[mode] }),
      reset: () => set({ mode: 'dark', accent: defaultAccent.dark }),
    }),
    {
      name: 'gymai-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode, accent: state.accent }),
      onRehydrateStorage: () => (state) => {
        // Marque l'hydratation terminée pour éviter un flash de thème par défaut.
        if (state) state.hydrated = true;
      },
    },
  ),
);
