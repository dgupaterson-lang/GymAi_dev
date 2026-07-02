/**
 * Fonctions d'accès à l'API d'authentification et de profil GymAI.
 * Toutes passent par l'instance axios `api` (intercepteurs token + refresh).
 */
import { api } from './client';
import { getRefresh } from './tokens';
import type {
  LoginBody,
  LoginResponse,
  Profile,
  RefreshResponse,
  RegisterBody,
  User,
} from './types';

/** POST /auth/register -> 201 (pas de token, enchaîner un login). */
export async function register(body: RegisterBody): Promise<User> {
  const resp = await api.post<User>('/auth/register', body);
  return resp.data;
}

/** POST /auth/login -> { access, refresh, user }. */
export async function login(body: LoginBody): Promise<LoginResponse> {
  const resp = await api.post<LoginResponse>('/auth/login', body);
  return resp.data;
}

/** POST /auth/refresh -> { access, refresh } (rotation). */
export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const resp = await api.post<RefreshResponse>('/auth/refresh', { refresh: refreshToken });
  return resp.data;
}

/**
 * POST /auth/logout -> 205 (blacklist du refresh).
 * Silencieux : un échec réseau ne doit pas empêcher la déconnexion locale.
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefresh();
  if (!refreshToken) return;
  try {
    await api.post('/auth/logout', { refresh: refreshToken });
  } catch {
    /* déconnexion locale garantie même si l'appel échoue */
  }
}

/** GET /me -> user avec profile. */
export async function getMe(): Promise<User> {
  const resp = await api.get<User>('/me');
  return resp.data;
}

/** PATCH /me/profile -> profil mis à jour. */
export async function patchProfile(patch: Partial<Profile>): Promise<Profile> {
  const resp = await api.patch<Profile>('/me/profile', patch);
  return resp.data;
}
