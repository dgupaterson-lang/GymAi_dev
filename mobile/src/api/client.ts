import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getRefreshToken, getToken, setTokens, clearTokens } from './tokens';

/**
 * Client HTTP GymAI (axios).
 *
 * baseURL : `process.env.EXPO_PUBLIC_API_URL` sinon défaut dev.
 * ⚠️ En Expo Go sur un téléphone PHYSIQUE, `localhost` pointe vers le téléphone,
 * pas vers le PC. Utilise l'IP LAN du PC (ex. http://192.168.1.20:8000/api/v1)
 * dans `.env` (EXPO_PUBLIC_API_URL). Voir .env.example / README.
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Callback appelé quand le refresh échoue définitivement (session morte).
 * Le store d'auth s'y branche pour purger l'état et renvoyer vers Welcome.
 * Découplé pour éviter une dépendance circulaire client <-> store.
 */
let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(cb: (() => void) | null) {
  onAuthFailure = cb;
}

/** Endpoints qui NE doivent jamais déclencher la logique de refresh. */
const AUTH_FREE_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

function isAuthFreePath(url?: string): boolean {
  if (!url) return false;
  return AUTH_FREE_PATHS.some((p) => url.includes(p));
}

// --- Intercepteur requête : injecte le token d'accès -------------------------
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (!isAuthFreePath(config.url)) {
    const token = await getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

// --- Intercepteur réponse : refresh 401 (une fois) + file d'attente ----------

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
// File des requêtes en attente pendant qu'un refresh est en cours.
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  pendingQueue = [];
}

/** Refresh « brut » : appel direct sans passer par `api` (évite la récursion). */
async function performRefresh(): Promise<string> {
  const refresh = await getRefreshToken();
  if (!refresh) throw new Error('no refresh token');
  // Instance nue : pas d'intercepteurs, pas de header Authorization.
  const resp = await axios.post(
    `${API_URL}/auth/refresh`,
    { refresh },
    { timeout: 15000, headers: { 'Content-Type': 'application/json' } },
  );
  const { access, refresh: newRefresh } = resp.data as {
    access: string;
    refresh?: string;
  };
  await setTokens(access, newRefresh ?? refresh);
  return access;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // Pas un 401, ou pas de config, ou endpoint d'auth, ou déjà rejoué -> on rejette.
    if (
      status !== 401 ||
      !original ||
      original._retry ||
      isAuthFreePath(original.url)
    ) {
      return Promise.reject(error);
    }

    // Un refresh est déjà en cours : on met la requête en file d'attente.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            original._retry = true;
            original.headers.set('Authorization', `Bearer ${token}`);
            resolve(api(original as AxiosRequestConfig));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const newToken = await performRefresh();
      flushQueue(null, newToken);
      original.headers.set('Authorization', `Bearer ${newToken}`);
      return api(original as AxiosRequestConfig);
    } catch (refreshError) {
      // Refresh KO -> session morte : on purge et on notifie le store.
      flushQueue(refreshError, null);
      await clearTokens();
      onAuthFailure?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
