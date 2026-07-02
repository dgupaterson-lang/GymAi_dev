/**
 * Stockage local des tokens JWT (localStorage).
 * Module isolé pour être partagé par le client axios et le store d'auth
 * sans créer de dépendance circulaire.
 */

const ACCESS_KEY = 'gymai.access';
const REFRESH_KEY = 'gymai.refresh';

/** Callback appelé quand les tokens sont purgés (déconnexion forcée après échec de refresh). */
type PurgeListener = () => void;
const purgeListeners = new Set<PurgeListener>();

/** Abonne un écouteur à la purge des tokens. Retourne la fonction de désabonnement. */
export function onTokensPurged(fn: PurgeListener): () => void {
  purgeListeners.add(fn);
  return () => purgeListeners.delete(fn);
}

export function getAccess(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function getRefresh(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setTokens(access: string, refresh: string): void {
  try {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  } catch {
    /* localStorage indisponible (mode privé) — on continue sans persistance */
  }
}

/** Purge les tokens et notifie les écouteurs (déconnexion). */
export function clearTokens(notify = true): void {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
  if (notify) {
    for (const fn of purgeListeners) {
      try {
        fn();
      } catch {
        /* un écouteur défaillant ne doit pas bloquer les autres */
      }
    }
  }
}

export function hasTokens(): boolean {
  return !!getAccess() && !!getRefresh();
}
