import { create } from 'zustand';
import * as authApi from '@/api/auth';
import { getToken, clearTokens } from '@/api/tokens';
import { setOnAuthFailure } from '@/api/client';
import type { User } from '@/api/types';
import { useThemeStore } from '@/theme';
import type { ThemeMode } from '@/theme';

/**
 * Store d'authentification GymAI.
 *
 * - `hydrate()` au boot : lit SecureStore ; si un token existe, appelle GET /me
 *   pour valider la session et récupérer l'utilisateur + son profil (thème).
 * - `login` / `register` / `logout`.
 * - À la connexion (login OU hydrate), on **hydrate le thème** depuis
 *   `user.profile` (theme_mode -> mode, accent_color -> accent) via le store thème.
 *
 * Repli gracieux : si l'API est injoignable au boot, on ne bloque pas l'app.
 * `hydrated` passe quand même à true ; l'utilisateur reste non authentifié
 * (mode démo local) et un warning est loggé.
 */

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** true une fois le boot terminé (succès OU repli). Gate le rendu de l'app. */
  hydrated: boolean;
  /** true pendant login/register (pour désactiver les boutons). */
  busy: boolean;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const ACCENT_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Applique le thème serveur (profil) au store thème local, si valide. */
function applyProfileTheme(user: User | null) {
  const profile = user?.profile;
  if (!profile) return;
  const theme = useThemeStore.getState();

  const mode = profile.theme_mode;
  if (mode === 'dark' || mode === 'rose') {
    theme.setMode(mode as ThemeMode);
  }
  const accent = profile.accent_color;
  if (accent && ACCENT_RE.test(accent)) {
    theme.setAccent(accent);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hydrated: false,
  busy: false,

  hydrate: async () => {
    try {
      const token = await getToken();
      if (!token) {
        set({ hydrated: true, isAuthenticated: false, user: null });
        return;
      }
      // Un token existe : on valide la session et on récupère le profil.
      const user = await authApi.getMe();
      applyProfileTheme(user);
      set({ user, isAuthenticated: true, hydrated: true });
    } catch (e) {
      // API injoignable / token mort -> repli gracieux (mode démo local).
      console.warn(
        '[auth] hydrate: session non restaurée (API injoignable ou token expiré). ' +
          'Repli en mode local.',
        e,
      );
      set({ hydrated: true, isAuthenticated: false, user: null });
    }
  },

  login: async (email, password) => {
    set({ busy: true });
    try {
      const { user } = await authApi.login(email, password);
      applyProfileTheme(user);
      set({ user, isAuthenticated: true });
    } finally {
      set({ busy: false });
    }
  },

  register: async (email, password, fullName, phone) => {
    set({ busy: true });
    try {
      // /register ne renvoie pas de token -> on enchaîne un login.
      await authApi.register({ email, password, full_name: fullName, phone });
      const { user } = await authApi.login(email, password);
      applyProfileTheme(user);
      set({ user, isAuthenticated: true });
    } finally {
      set({ busy: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('[auth] logout a échoué (purge locale quand même):', e);
    } finally {
      await clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },
}));

/**
 * Branche le repli du client HTTP : si un refresh échoue définitivement,
 * on remet l'état d'auth à zéro (l'UI redirige alors vers Welcome).
 * Appelé une fois au module load.
 */
setOnAuthFailure(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});
