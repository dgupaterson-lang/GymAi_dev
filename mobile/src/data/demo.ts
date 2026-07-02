import type {
  Adherent,
  Enrollment,
  Exercise,
  Program,
} from '@/api/programs';
import type { ResolvedInvitation } from '@/api/invitations';

/**
 * Données démo cohérentes pour le repli gracieux (docs/16 §Repli, RG comme auth).
 * Utilisées quand l'API est injoignable : l'app affiche un état plausible au
 * lieu de planter, et rebascule sur l'API réelle dès qu'elle répond.
 */

/** Catalogue d'exercices mock (seed docs/16 : 4 exos de web/src/data.ts). */
export const DEMO_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: 'Développé couché',
    muscle: 'Pectoraux',
    default_sets: 4,
    default_reps: 10,
    default_rest_s: 90,
    charge_hint: '60 kg',
  },
  {
    id: 2,
    name: 'Écarté poulie',
    muscle: 'Pectoraux',
    default_sets: 3,
    default_reps: 12,
    default_rest_s: 60,
    charge_hint: '15 kg',
  },
  {
    id: 3,
    name: 'Dips lestés',
    muscle: 'Triceps',
    default_sets: 4,
    default_reps: 8,
    default_rest_s: 90,
    charge_hint: '+10 kg',
  },
  {
    id: 4,
    name: 'Extension triceps',
    muscle: 'Triceps',
    default_sets: 3,
    default_reps: 15,
    default_rest_s: 45,
    charge_hint: '25 kg',
  },
];

export const DEMO_PROGRAM: Program = {
  id: 9001,
  title: 'Défi 30 jours — Prise de masse',
  description:
    'Programme coaché suivi sur 1 mois. 3 séances / semaine, focus haut du corps.',
  kind: 'coach_shared',
  objective: 'Prendre du muscle',
  level: 'Intermédiaire',
  duration_days: 30,
  is_shared: true,
  is_active: true,
  generated_by: 'coach',
  coach_name: 'Coach Marc',
  enrollments_count: 12,
  days: [
    {
      id: 1,
      title: 'Pectoraux & Triceps',
      weekday: 1,
      order: 0,
      exercises: [
        { exercise_name: 'Développé couché', sets: 4, reps: 10, charge: '60 kg', rest_s: 90 },
        { exercise_name: 'Écarté poulie', sets: 3, reps: 12, charge: '15 kg', rest_s: 60 },
        { exercise_name: 'Dips lestés', sets: 4, reps: 8, charge: '+10 kg', rest_s: 90 },
      ],
    },
    {
      id: 2,
      title: 'Volume & Finition',
      weekday: 4,
      order: 1,
      exercises: [
        { exercise_name: 'Extension triceps', sets: 3, reps: 15, charge: '25 kg', rest_s: 45 },
      ],
    },
  ],
};

export const DEMO_PROGRAM_2: Program = {
  id: 9002,
  title: 'Cardio Endurance 30 j',
  description: 'Cycle cardio progressif pour améliorer le souffle et brûler.',
  kind: 'coach_shared',
  objective: 'Perdre du gras',
  level: 'Débutant',
  duration_days: 30,
  is_shared: true,
  generated_by: 'coach',
  coach_name: 'Coach Marc',
  enrollments_count: 5,
  days: [],
};

export const DEMO_COACHED_PROGRAMS: Program[] = [DEMO_PROGRAM, DEMO_PROGRAM_2];

export const DEMO_ENROLLMENT: Enrollment = {
  id: 8001,
  program: { id: DEMO_PROGRAM.id, title: DEMO_PROGRAM.title, duration_days: 30 },
  start_date: '2026-06-24',
  end_date: '2026-07-24',
  status: 'active',
  sessions_done: 3,
  sessions_target: 12,
  adherence_pct: 25,
  days_remaining: 23,
};

export const DEMO_ENROLLMENTS: Enrollment[] = [DEMO_ENROLLMENT];

export const DEMO_ADHERENTS: Adherent[] = [
  { member: { id: 42, full_name: 'David Mensah' }, status: 'active', sessions_done: 9, sessions_target: 12, adherence_pct: 75 },
  { member: { id: 43, full_name: 'Awa Traoré' }, status: 'active', sessions_done: 6, sessions_target: 12, adherence_pct: 50 },
  { member: { id: 44, full_name: 'Kevin Doe' }, status: 'active', sessions_done: 2, sessions_target: 12, adherence_pct: 17 },
];

/** Invitations « reçues » démo (côté membre). */
export const DEMO_RECEIVED_INVITATIONS: ResolvedInvitation[] = [
  {
    token: 'demo-token-abcdef',
    status: 'pending',
    expires_at: '2026-07-08',
    kind: 'program',
    from_coach: { id: 1, full_name: 'Coach Marc' },
    program: {
      id: DEMO_PROGRAM.id,
      title: DEMO_PROGRAM.title,
      description: DEMO_PROGRAM.description,
      duration_days: 30,
      days_count: 2,
    },
  },
];

export const DEMO_RESOLVED_INVITATION: ResolvedInvitation =
  DEMO_RECEIVED_INVITATIONS[0];
