/**
 * Instance axios centrale de l'app web GymAI.
 *
 * - baseURL depuis `import.meta.env.VITE_API_URL` (défaut localhost:8000).
 * - Intercepteur requête : injecte `Authorization: Bearer <access>`.
 * - Intercepteur réponse 401 : tente UNE seule fois `/auth/refresh`, met en
 *   file d'attente les requêtes concurrentes pendant le refresh, rejoue la
 *   requête d'origine ; en cas d'échec, purge les tokens (déconnexion).
 * - Anti-boucle : les endpoints d'auth (login/refresh) ne déclenchent pas de
 *   refresh, et une requête déjà rejouée n'est pas retentée.
 */
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { clearTokens, getAccess, getRefresh, setTokens } from './tokens';

/** Base d'API : variable d'env Vite ou défaut de dev. */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000/api/v1';

/** Timeout raisonnable pour permettre le repli gracieux si l'API est injoignable. */
const TIMEOUT_MS = 8000;

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

/** Extension interne : marque une requête déjà rejouée après refresh. */
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/** Chemins d'auth qui ne doivent JAMAIS déclencher de refresh (anti-boucle). */
const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/register'];

function isAuthPath(url?: string): boolean {
  if (!url) return false;
  return AUTH_PATHS.some((p) => url.includes(p));
}

// ---- Intercepteur requête : injecte le token d'accès --------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccess();
  if (token && !isAuthPath(config.url)) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ---- Gestion du refresh concurrent (file d'attente) ---------------------
let isRefreshing = false;
/** File des résolveurs en attente du nouveau token pendant un refresh en cours. */
let waiters: Array<(token: string | null) => void> = [];

function flushWaiters(token: string | null): void {
  const pending = waiters;
  waiters = [];
  for (const resolve of pending) resolve(token);
}

/**
 * Effectue le refresh en utilisant une instance axios NUE (sans intercepteurs)
 * pour éviter toute récursion. Retourne le nouveau token d'accès ou null.
 */
async function performRefresh(): Promise<string | null> {
  const refresh = getRefresh();
  if (!refresh) return null;
  try {
    const resp = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refresh },
      { timeout: TIMEOUT_MS, headers: { 'Content-Type': 'application/json' } },
    );
    const data = resp.data as { access?: string; refresh?: string };
    if (data.access && data.refresh) {
      setTokens(data.access, data.refresh);
      return data.access;
    }
    return null;
  } catch {
    return null;
  }
}

// ---- Intercepteur réponse : gère le 401 avec refresh unique -------------
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    // Pas de config, pas de réponse (réseau/timeout), ou statut != 401 :
    // on laisse remonter l'erreur (le repli gracieux est géré en amont).
    if (!original || !error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Anti-boucle : jamais de refresh sur les endpoints d'auth, ni sur une
    // requête déjà rejouée.
    if (isAuthPath(original.url) || original._retry) {
      clearTokens();
      return Promise.reject(error);
    }

    // Pas de refresh token disponible → déconnexion.
    if (!getRefresh()) {
      clearTokens();
      return Promise.reject(error);
    }

    original._retry = true;

    // Un refresh est déjà en cours : on attend son résultat (file d'attente).
    if (isRefreshing) {
      const token = await new Promise<string | null>((resolve) => waiters.push(resolve));
      if (!token) return Promise.reject(error);
      original.headers.set('Authorization', `Bearer ${token}`);
      return api(original);
    }

    // Déclenche le refresh unique.
    isRefreshing = true;
    const newToken = await performRefresh();
    isRefreshing = false;
    flushWaiters(newToken);

    if (!newToken) {
      clearTokens(); // purge + notifie la déconnexion
      return Promise.reject(error);
    }

    original.headers.set('Authorization', `Bearer ${newToken}`);
    return api(original);
  },
);

/** Indique si une erreur axios provient d'un problème réseau (repli gracieux). */
export function isNetworkError(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  const e = err as AxiosError;
  // Pas de réponse = timeout, DNS, connexion refusée, CORS bloqué, etc.
  return !e.response;
}

/** Extrait un message d'erreur lisible depuis une réponse d'API (400/401...). */
export function extractApiError(err: unknown, fallback = 'Une erreur est survenue.'): string {
  if (!axios.isAxiosError(err)) return fallback;
  const e = err as AxiosError;
  if (!e.response) return 'Serveur injoignable.';
  const data: unknown = e.response.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    // DRF renvoie souvent { detail } ou { champ: [messages] }.
    const detail = (data as Record<string, unknown>).detail;
    if (typeof detail === 'string') return detail;
    // Concatène le premier message de champ trouvé.
    for (const key of Object.keys(data)) {
      const v = (data as Record<string, unknown>)[key];
      if (typeof v === 'string') return v;
      if (Array.isArray(v) && v.length && typeof v[0] === 'string') return v[0] as string;
    }
  }
  if (e.response.status === 401) return 'Identifiants invalides.';
  return fallback;
}

export type { AxiosRequestConfig };
