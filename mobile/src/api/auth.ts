import { api } from './client';
import { setTokens, clearTokens, getRefreshToken } from './tokens';
import type {
  LoginResponse,
  ProfilePatch,
  RegisterPayload,
  User,
  UserProfile,
} from './types';

/**
 * Fonctions d'accès à l'API d'authentification / profil.
 * Chaque fonction laisse remonter les erreurs axios : l'appelant (store) décide
 * du repli. Les tokens sont écrits dans SecureStore ici (login/refresh).
 */

/** POST /auth/register -> 201 (pas de token). Enchaîner login côté appelant. */
export async function register(payload: RegisterPayload): Promise<void> {
  await api.post('/auth/register', payload);
}

/** POST /auth/login -> { access, refresh, user }. Persiste les tokens. */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
  await setTokens(data.access, data.refresh);
  return data;
}

/** POST /auth/refresh -> { access, refresh }. Persiste les nouveaux tokens. */
export async function refresh(): Promise<{ access: string; refresh: string }> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error('no refresh token');
  const { data } = await api.post<{ access: string; refresh: string }>(
    '/auth/refresh',
    { refresh: refreshToken },
  );
  await setTokens(data.access, data.refresh);
  return data;
}

/**
 * POST /auth/logout -> 205. Blacklist le refresh côté serveur, purge local.
 * Best-effort : purge locale même si l'appel réseau échoue.
 */
export async function logout(): Promise<void> {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await api.post('/auth/logout', { refresh: refreshToken });
    }
  } catch (e) {
    console.warn('[auth] logout réseau a échoué (purge locale quand même):', e);
  } finally {
    await clearTokens();
  }
}

/** GET /me -> user (avec profile). */
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/me');
  return data;
}

/** PATCH /me/profile -> profil mis à jour. */
export async function patchProfile(patch: ProfilePatch): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>('/me/profile', patch);
  return data;
}
