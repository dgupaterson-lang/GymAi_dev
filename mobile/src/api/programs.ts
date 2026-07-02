import { api } from './client';

/**
 * Module API — programmes coachés & adhésions (docs/16, RG-50..55).
 *
 * Chaque fonction laisse remonter les erreurs axios : l'appelant (écran/hook)
 * décide du repli en données démo (comme pour l'auth, docs/15).
 * Types volontairement permissifs : le backend peut renvoyer plus de champs.
 */

// --- Types -------------------------------------------------------------------

export interface Exercise {
  id: number;
  name: string;
  muscle?: string;
  default_sets?: number;
  default_reps?: number;
  default_rest_s?: number;
  charge_hint?: string;
  video_url?: string | null;
  thumbnail?: string | null;
}

export interface ExercisePrescription {
  id?: number;
  exercise?: Exercise;
  /** Nom affichable si le backend n'imbrique pas l'exercice complet. */
  exercise_name?: string;
  sets: number;
  reps: number;
  charge?: string;
  rest_s?: number;
  order?: number;
}

export interface ProgramDay {
  id?: number;
  title: string;
  weekday?: number | null;
  order?: number;
  exercises?: ExercisePrescription[];
}

export type ProgramKind = 'personal' | 'coach_shared';

export interface Program {
  id: number;
  title: string;
  description?: string;
  kind?: ProgramKind;
  objective?: string;
  level?: string;
  duration_days: number;
  is_shared?: boolean;
  is_active?: boolean;
  generated_by?: 'ai' | 'coach';
  summary?: string;
  owner_coach?: number | { id: number; full_name?: string } | null;
  /** nom du coach si le backend l'aplatit */
  coach_name?: string;
  gym?: number | null;
  days?: ProgramDay[];
  /** présent sur GET /coach/programs/{id} */
  enrollments_count?: number;
  created_at?: string;
}

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface EnrollmentProgramRef {
  id: number;
  title: string;
  duration_days?: number;
}

export interface Enrollment {
  id: number;
  program: EnrollmentProgramRef;
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  sessions_done: number;
  sessions_target: number;
  adherence_pct: number;
  /** jours restants avant end_date (renvoyé par GET /enrollments/{id}) */
  days_remaining?: number;
}

export interface Adherent {
  member: { id: number; full_name?: string };
  status: EnrollmentStatus;
  sessions_done: number;
  sessions_target: number;
  adherence_pct: number;
}

// --- Payloads création ------------------------------------------------------

export interface PrescriptionInput {
  exercise_id: number;
  sets: number;
  reps: number;
  charge?: string;
  rest_s?: number;
  order?: number;
}

export interface ProgramDayInput {
  title: string;
  weekday?: number | null;
  order?: number;
  exercises: PrescriptionInput[];
}

export interface CreateProgramPayload {
  title: string;
  description?: string;
  duration_days: number;
  objective?: string;
  level?: string;
  days: ProgramDayInput[];
}

// --- Côté membre ------------------------------------------------------------

/** GET /programs/coached?gym= — programmes coachés découvrables. */
export async function listCoachedPrograms(gymId?: number | string): Promise<Program[]> {
  const { data } = await api.get<Program[] | { results: Program[] }>(
    '/programs/coached',
    { params: gymId != null ? { gym: gymId } : undefined },
  );
  return Array.isArray(data) ? data : data.results ?? [];
}

/** GET /programs/{id} — détail (jours + exercices). */
export async function getProgram(id: number | string): Promise<Program> {
  const { data } = await api.get<Program>(`/programs/${id}`);
  return data;
}

/** POST /programs/{id}/enroll — adhésion (start = aujourd'hui). */
export async function enroll(id: number | string): Promise<Enrollment> {
  const { data } = await api.post<Enrollment>(`/programs/${id}/enroll`);
  return data;
}

/** GET /me/enrollments — mes adhésions + progression. */
export async function myEnrollments(): Promise<Enrollment[]> {
  const { data } = await api.get<Enrollment[] | { results: Enrollment[] }>(
    '/me/enrollments',
  );
  return Array.isArray(data) ? data : data.results ?? [];
}

/** GET /enrollments/{id} — détail adhésion (adherence, jours restants). */
export async function getEnrollment(id: number | string): Promise<Enrollment> {
  const { data } = await api.get<Enrollment>(`/enrollments/${id}`);
  return data;
}

/** POST /enrollments/{id}/log-session — incrémente sessions_done (borné à target). */
export async function logSession(id: number | string): Promise<Enrollment> {
  const { data } = await api.post<Enrollment>(`/enrollments/${id}/log-session`);
  return data;
}

// --- Côté coach -------------------------------------------------------------

/** GET /coach/programs — mes programmes coachés. */
export async function coachPrograms(): Promise<Program[]> {
  const { data } = await api.get<Program[] | { results: Program[] }>(
    '/coach/programs',
  );
  return Array.isArray(data) ? data : data.results ?? [];
}

/** POST /coach/programs — crée un programme coaché. */
export async function createCoachProgram(
  payload: CreateProgramPayload,
): Promise<Program> {
  const { data } = await api.post<Program>('/coach/programs', payload);
  return data;
}

/** GET /coach/programs/{id}/adherents — adhérents + adherence_pct. */
export async function programAdherents(
  id: number | string,
): Promise<Adherent[]> {
  const { data } = await api.get<Adherent[] | { results: Adherent[] }>(
    `/coach/programs/${id}/adherents`,
  );
  return Array.isArray(data) ? data : data.results ?? [];
}
