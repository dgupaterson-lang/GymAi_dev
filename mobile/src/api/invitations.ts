import { api } from './client';
import type { Enrollment } from './programs';

/**
 * Module API — invitations (docs/16, RG-56..60).
 * Une invitation encode un `token` UUID et un deep link `gymai://invite/<token>`.
 */

export type InvitationKind = 'program' | 'group';
export type InvitationTargetType = 'member' | 'contact';
export type InvitationStatus = 'pending' | 'accepted' | 'expired';

export interface Invitation {
  token: string;
  url?: string;
  status: InvitationStatus;
  expires_at?: string;
  kind?: InvitationKind;
  program_id?: number;
  from_coach?: { id: number; full_name?: string } | number;
  created_at?: string;
}

/** Résumé renvoyé par GET /invitations/{token} (résolution avant adhésion). */
export interface ResolvedInvitation {
  token: string;
  status: InvitationStatus;
  expires_at?: string;
  kind?: InvitationKind;
  from_coach?: { id: number; full_name?: string };
  program?: {
    id: number;
    title: string;
    description?: string;
    duration_days?: number;
    days_count?: number;
  };
}

export interface CreateInvitationPayload {
  kind: InvitationKind;
  program_id?: number;
  group_id?: number;
  target_type: InvitationTargetType;
  member_id?: number;
  /** téléphone / e-mail pour une cible externe */
  contact?: string;
}

/** POST /invitations — crée une invitation → token + url + expires_at. */
export async function createInvitation(
  payload: CreateInvitationPayload,
): Promise<Invitation> {
  const { data } = await api.post<Invitation>('/invitations', payload);
  return data;
}

/** GET /invitations/{token} — résout une invitation (résumé programme + statut). */
export async function resolveInvitation(
  token: string,
): Promise<ResolvedInvitation> {
  const { data } = await api.get<ResolvedInvitation>(
    `/invitations/${token}`,
  );
  return data;
}

/** POST /invitations/{token}/accept — accepte → auto-enroll → renvoie enrollment (RG-58). */
export async function acceptInvitation(token: string): Promise<Enrollment> {
  const { data } = await api.post<Enrollment>(
    `/invitations/${token}/accept`,
  );
  return data;
}
