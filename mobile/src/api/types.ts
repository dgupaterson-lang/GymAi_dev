import type { ThemeMode } from '@/theme';

/**
 * Types du contrat d'API GymAI (voir docs/15-integration-fronts-backend.md).
 * Volontairement permissifs (champs optionnels) : le backend peut renvoyer plus
 * de champs que l'app n'en consomme.
 */

export interface UserProfile {
  theme_mode?: ThemeMode;
  accent_color?: string;
  objective?: string;
  level?: string;
  weekly_freq?: number;
  voice_cues?: boolean;
  birthdate?: string | null;
  height_cm?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number | string;
  email: string;
  full_name?: string;
  phone?: string | null;
  role?: string;
  avatar?: string | null;
  is_verified?: boolean;
  is_active?: boolean;
  date_joined?: string;
  profile?: UserProfile;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface ProfilePatch {
  accent_color?: string;
  theme_mode?: ThemeMode;
  objective?: string;
  level?: string;
  weekly_freq?: number;
  voice_cues?: boolean;
  birthdate?: string | null;
  height_cm?: number | null;
}
