import { useEffect, useRef } from 'react';
import { patchProfile } from '@/api/auth';
import { useThemeStore } from '@/theme';
import type { ThemeMode } from '@/theme';
import { useAuthStore } from './auth';

/**
 * Synchronisation du thème vers le serveur.
 *
 * Quand l'utilisateur est CONNECTÉ, tout changement de `mode` ou `accent`
 * (ex. via le ColorPicker) déclenche un PATCH /me/profile { theme_mode,
 * accent_color } DÉBOUNCÉ (~500 ms). AsyncStorage reste le cache offline
 * (géré par le store thème persisté) : on n'attend jamais le réseau côté UI.
 *
 * Déconnecté -> aucune requête (persistance locale uniquement).
 * Repli gracieux : un PATCH qui échoue est loggé, sans casser l'app.
 */
const DEBOUNCE_MS = 500;

export function useThemeServerSync() {
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Évite un PATCH inutile juste après l'hydratation (valeurs identiques au serveur).
  const lastSynced = useRef<string | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (!isAuthenticated) {
      // Réinitialise le garde quand on se déconnecte / avant connexion.
      firstRun.current = true;
      lastSynced.current = null;
      return;
    }

    const signature = `${mode}|${accent}`;

    // Premier passage après connexion : on considère l'état déjà synchronisé
    // (il vient d'être hydraté depuis le serveur) -> pas de PATCH.
    if (firstRun.current) {
      firstRun.current = false;
      lastSynced.current = signature;
      return;
    }

    if (signature === lastSynced.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      lastSynced.current = signature;
      patchProfile({
        theme_mode: mode as ThemeMode,
        accent_color: accent,
      }).catch((e) => {
        // Repli gracieux : on ne bloque pas, on autorisera un nouvel essai.
        lastSynced.current = null;
        console.warn('[themeSync] PATCH /me/profile a échoué:', e);
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [mode, accent, isAuthenticated]);
}
