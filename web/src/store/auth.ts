/**
 * Store d'authentification GymAI (indépendant de React, abonnable).
 *
 * Détient l'utilisateur courant et l'état `isAuthenticated`, et expose les
 * actions `login`, `register`, `logout`, `bootstrap`. La couche UI s'y abonne
 * via le hook `useAuth` (voir plus bas) pour rester synchronisée.
 *
 * L'hydratation du thème (mode/accent depuis `user.profile`) n'est PAS faite
 * ici : le store se contente d'exposer `user`. C'est `useGymApp` qui, quand
 * `user` change, applique le thème via ses propres setters — ainsi le store
 * reste découplé de la logique de rendu.
 */
import { useSyncExternalStore } from 'react';
import * as authApi from '../api/auth';
import { isNetworkError } from '../api/client';
import { clearTokens, hasTokens, onTokensPurged, setTokens } from '../api/tokens';
import type { LoginBody, RegisterBody, User } from '../api/types';

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  /** Vrai tant que le bootstrap initial (GET /me) n'est pas terminé. */
  bootstrapping: boolean;
};

let state: AuthState = {
  user: null,
  isAuthenticated: false,
  bootstrapping: false,
};

const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

function setState(patch: Partial<AuthState>): void {
  state = { ...state, ...patch };
  emit();
}

/** Abonnement bas niveau (utilisé par useSyncExternalStore). */
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AuthState {
  return state;
}

// Déconnexion forcée : quand les tokens sont purgés (échec de refresh), on
// repasse `isAuthenticated` à false et on oublie l'utilisateur.
onTokensPurged(() => {
  if (state.isAuthenticated || state.user) {
    setState({ user: null, isAuthenticated: false });
  }
});

// ---- Actions -------------------------------------------------------------

/** Connexion réelle : POST /auth/login, stocke tokens + user. */
async function login(body: LoginBody): Promise<User> {
  const { access, refresh, user } = await authApi.login(body);
  setTokens(access, refresh);
  setState({ user, isAuthenticated: true });
  return user;
}

/** Inscription puis auto-login (le register ne renvoie pas de token). */
async function register(body: RegisterBody): Promise<User> {
  await authApi.register(body);
  return login({ email: body.email, password: body.password });
}

/** Déconnexion : blacklist du refresh côté serveur (best-effort) puis purge locale. */
async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    /* best-effort */
  }
  clearTokens(false); // purge silencieuse (on gère l'état ici même)
  setState({ user: null, isAuthenticated: false });
}

/**
 * Au démarrage : si des tokens existent, tente GET /me pour réhydrater `user`.
 * Repli gracieux : si l'API est injoignable, on ne purge pas les tokens (on
 * pourra réessayer plus tard) et on reste simplement non authentifié en mémoire.
 */
async function bootstrap(): Promise<User | null> {
  if (!hasTokens()) return null;
  setState({ bootstrapping: true });
  try {
    const user = await authApi.getMe();
    setState({ user, isAuthenticated: true, bootstrapping: false });
    return user;
  } catch (err) {
    if (isNetworkError(err)) {
      // Serveur injoignable : on garde les tokens, on ne casse rien.
      setState({ bootstrapping: false });
      return null;
    }
    // 401 / token invalide : purge (les intercepteurs ont pu déjà le faire).
    clearTokens(false);
    setState({ user: null, isAuthenticated: false, bootstrapping: false });
    return null;
  }
}

export const authStore = {
  getSnapshot,
  subscribe,
  login,
  register,
  logout,
  bootstrap,
};

// ---- Hook React ----------------------------------------------------------

/**
 * Hook d'accès au store d'auth. Retourne l'état réactif + les actions.
 * `user`, `isAuthenticated` se mettent à jour automatiquement.
 */
export function useAuth() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    user: snapshot.user,
    isAuthenticated: snapshot.isAuthenticated,
    bootstrapping: snapshot.bootstrapping,
    login,
    register,
    logout,
    bootstrap,
  };
}
