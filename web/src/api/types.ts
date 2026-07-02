/**
 * Types du contrat d'API GymAI (app `accounts` du backend).
 * Voir docs/15-integration-fronts-backend.md pour le contrat complet.
 */

/** Mode de thème côté backend ('dark' | 'rose'), distinct du ThemeName UI ('Dark' | 'Rose'). */
export type ApiThemeMode = 'dark' | 'rose';

/** Profil utilisateur renvoyé par le backend (imbriqué dans `user.profile`). */
export type Profile = {
  objective?: string;
  level?: string;
  weekly_freq?: number;
  theme_mode?: ApiThemeMode;
  accent_color?: string;
  voice_cues?: boolean;
  birthdate?: string | null;
  height_cm?: number | null;
  created_at?: string;
  updated_at?: string;
};

/** Utilisateur authentifié renvoyé par `/auth/login` et `/me`. */
export type User = {
  id: number | string;
  email: string;
  phone?: string | null;
  full_name?: string;
  role?: string;
  avatar?: string | null;
  is_verified?: boolean;
  is_active?: boolean;
  date_joined?: string;
  profile?: Profile;
};

/** Réponse de `/auth/login`. */
export type LoginResponse = {
  access: string;
  refresh: string;
  user: User;
};

/** Réponse de `/auth/refresh` (rotation). */
export type RefreshResponse = {
  access: string;
  refresh: string;
};

/** Corps de `/auth/register`. */
export type RegisterBody = {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
};

/** Corps de `/auth/login`. */
export type LoginBody = {
  email: string;
  password: string;
};
