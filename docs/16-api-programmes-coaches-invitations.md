# 16 — Contrat d'API : programmes coachés & invitations (Sprint 2)

Contrat commun backend ↔ fronts pour la feature « programmes coachés + adhésions 30 j +
invitations ». Règles associées : `docs/14` (RG-50..60). Base : `/api/v1`.

## Modèles (backend)

### catalog.Exercise (minimal — pour les prescriptions)
`name`, `muscle` (label), `default_sets`, `default_reps`, `default_rest_s`,
`charge_hint`, `video_url?`, `thumbnail?`. **Seed** : les 4 exercices de `web/src/data.ts`
(Développé couché, Écarté poulie, Dips lestés, Extension triceps).

### programs.Program
`id`, `member FK(User, null)` *(null = template partagé non assigné)*,
`owner_coach FK(User, null)`, `gym FK(Gym, null)`, `title`, `description`,
`kind ∈ {personal, coach_shared}`, `objective`, `level`, `duration_days` (défaut **30**),
`is_shared Bool`, `is_active Bool`, `generated_by ∈ {ai, coach}`, `summary`, `created_at`.
Programme coaché = `kind=coach_shared`, `owner_coach` défini, `is_shared=True`, `member=null`.

### programs.ProgramDay
`program FK`, `title`, `weekday Int?`, `order`.

### programs.ExercisePrescription
`program_day FK`, `exercise FK(catalog.Exercise)`, `sets`, `reps`, `charge`, `rest_s`, `order`.

### programs.ProgramEnrollment (adhésion)
`member FK`, `program FK(coach_shared)`, `coach FK(User)` *(= program.owner_coach)*,
`start_date`, `end_date` *(= start + duration_days)*, `status ∈ {active, completed, dropped}`,
`sessions_done Int`, `sessions_target Int`, `created_at`.
`adherence_pct` = propriété `= round(100 * sessions_done / max(sessions_target,1))`.
`sessions_target` calculé à l'adhésion = `nb_ProgramDay × ceil(duration_days/7)`.
Unicité `(member, program, start_date)`. RG-52.

### invitations.Invitation
`from_coach FK(User)`, `kind ∈ {program, group}`, `program FK(null)`, `group FK(null)`,
`target_type ∈ {member, contact}`, `member FK(null)`, `contact Char(null)`,
`token` (UUID unique), `status ∈ {pending, accepted, expired}`, `expires_at`,
`accepted_by FK(User, null)`, `created_at`. RG-56..60.

## Endpoints

### Côté coach (role `coach` ou `manager`, propriétaire de l'objet)
| Méthode | URL | Corps / notes |
|---|---|---|
| POST | `/coach/programs` | crée un programme coaché (cf. payload) |
| GET | `/coach/programs` | mes programmes coachés |
| GET | `/coach/programs/{id}` | détail + `enrollments_count` |
| GET | `/coach/programs/{id}/adherents` | liste des adhésions + `adherence_pct` |
| POST | `/invitations` | crée une invitation → renvoie `token` + `url` + `expires_at` |
| GET | `/coach/invitations?program={id}` | invitations + stats conversion (`sent`, `accepted`) |

### Côté membre (authentifié)
| Méthode | URL | Corps / notes |
|---|---|---|
| GET | `/programs/coached?gym={id}` | programmes coachés découvrables (salle) |
| GET | `/programs/{id}` | détail programme coaché (jours + exercices) |
| POST | `/programs/{id}/enroll` | adhésion (start = aujourd'hui, end = +duration) → 201 enrollment |
| GET | `/me/enrollments` | mes adhésions + progression |
| GET | `/enrollments/{id}` | détail adhésion (adherence, jours restants) |
| POST | `/enrollments/{id}/log-session` | incrémente `sessions_done` (borné à target) — MVP du suivi |
| GET | `/invitations/{token}` | résout une invitation (résumé programme + statut) |
| POST | `/invitations/{token}/accept` | accepte → **auto-enroll** → renvoie enrollment (RG-58) |

## Payloads (exemples)

**POST `/coach/programs`**
```json
{
  "title": "Défi 30 jours — Prise de masse",
  "description": "Programme coaché suivi sur 1 mois.",
  "duration_days": 30, "objective": "Prendre du muscle", "level": "Intermédiaire",
  "days": [
    { "title": "Pectoraux & Triceps", "weekday": 1, "order": 0,
      "exercises": [
        { "exercise_id": 1, "sets": 4, "reps": 10, "charge": "60 kg", "rest_s": 90, "order": 0 }
      ] }
  ]
}
→ 201 { "id": 7, "title": "...", "duration_days": 30, "days": [ ... ] }
```

**POST `/invitations`**
```json
{ "kind": "program", "program_id": 7, "target_type": "member", "member_id": 42 }
// ou pour un contact externe :
{ "kind": "program", "program_id": 7, "target_type": "contact", "contact": "+2250700000000" }
→ 201 { "token": "8f3c…", "url": "gymai://invite/8f3c…", "expires_at": "…", "status": "pending" }
```

**GET `/enrollments/{id}`**
```json
→ 200 { "id": 12, "program": { "id": 7, "title": "Défi 30 jours — Prise de masse" },
  "start_date": "2026-07-01", "end_date": "2026-07-31", "status": "active",
  "sessions_done": 3, "sessions_target": 12, "adherence_pct": 25, "days_remaining": 23 }
```

**GET `/coach/programs/{id}/adherents`**
```json
→ 200 [ { "member": { "id": 42, "full_name": "David Mensah" },
  "status": "active", "sessions_done": 3, "sessions_target": 12, "adherence_pct": 25 } ]
```

## Permissions
- `/coach/*` : role `coach`/`manager` **et** propriétaire (`owner_coach == user`).
- `enroll` / `accept` : membre authentifié (MVP : ouvert ; RG-55 à durcir : même salle).
- Un membre ne voit que **ses** adhésions ; le coach voit celles de **ses** programmes (RG-40/54).

## Deep link (invitations → téléchargement)
- Schéma `gymai://invite/<token>` (route mobile `app/invite/[token].tsx`).
- App installée → résout + propose d'adhérer. App absente → store → (deferred deep link =
  service d'attribution, **hors scope MVP**, à noter). Lien partageable via partage natif/QR.

## Repli / démo
Les fronts fonctionnent en **données démo** si l'API est injoignable (pas de crash), et
basculent sur l'API réelle dès qu'elle répond (comme pour l'auth, docs/15).
