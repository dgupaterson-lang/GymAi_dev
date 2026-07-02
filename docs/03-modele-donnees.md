# 03 — Modèle de données

PostgreSQL. Chaque app Django porte ses modèles. Tous les modèles ont `id` (BigAuto)
sauf mention. Conventions : `created_at`/`updated_at` (auto), suppression **logique**
(`is_active`/`status`) là où l'historique compte.

## Diagramme relationnel (vue d'ensemble)

```
User ─1:1─ Profile
User ─1:N─ Membership ─N:1─ Gym
User(coach) ─M:N─ Gym                 (CoachGym)
User(coach) ─1:N─ CoachAssignment ─N:1─ User(member)

Gym ─1:N─ Group ─1:N─ GroupMembership ─N:1─ User(member)
Group ─1:N─ GroupSession ─1:N─ SessionEnrollment ─N:1─ User(member)
GroupSession ─1:N─ Attendance ─N:1─ User(member)

User(member) ─1:N─ Program ─1:N─ ProgramDay ─1:N─ ExercisePrescription ─N:1─ Exercise
Exercise ─N:1─ MuscleGroup ; Exercise ─M:N─ MuscleGroup (secondaires) ; Exercise ─M:N─ Injury (contre-indications)
Exercise ─1:N─ Tip

User(member) ─1:N─ WorkoutSession ─1:N─ SetLog ─N:1─ Exercise

Conversation ─1:N─ Message            (type: coach_ai | group | direct)
Conversation ─N:1─ User(member)       (si coach_ai)
Conversation ─N:1─ Group              (si group)

User(member) ─1:N─ Meal ─1:1─ MealAnalysis
User(member) ─1:N─ BodyMetric
User(member) ─1:N─ ProgressPhoto

Plan ─1:N─ Subscription ─N:1─ User(member) ; Subscription ─1:N─ Payment
User ─1:N─ Device ; User ─1:N─ Notification
User ─1:N─ AIRequestLog
```

---

## app `accounts`

### User (`AbstractBaseUser`)
| Champ | Type | Notes |
|---|---|---|
| email | Email, unique | `USERNAME_FIELD` |
| phone | Char, unique, null | format international |
| full_name | Char | |
| role | Char(choices) | member / coach / manager / admin (RG-01) |
| avatar | Image, null | |
| is_verified | Bool | RG-05 |
| is_active, is_staff | Bool | |
| date_joined | DateTime | |

### Profile (1:1 User — membre)
| Champ | Type | Notes |
|---|---|---|
| objective | Char(choices) | Perdre du poids / Prendre du muscle / Forme & tonus / Endurance |
| level | Char(choices) | Débutant / Intermédiaire / Avancé |
| weekly_freq | Int | 2..6 (RG-13) |
| injuries | M2M(Injury) | RG-12 |
| theme_mode | Char(choices) | dark / rose — mode de base (fond/surfaces/texte) |
| accent_color | Char(7) | couleur d'accent **libre** (hex), défaut `#5fe3f0` (cf. doc 13) |
| voice_cues | Bool | RG-16 |
| birthdate | Date, null | |
| height_cm | Int, null | sert au calcul IMC |

### Membership
| Champ | Type | Notes |
|---|---|---|
| user | FK(User) | |
| gym | FK(Gym) | |
| status | Char | active / paused / left |
| is_current | Bool | une seule = True par user (RG-02) |
| joined_at | DateTime | |

### CoachAssignment
`coach FK(User)`, `member FK(User)`, `gym FK(Gym)`, `since DateTime`, `is_active`.
*(Unicité `coach+member`.)*

---

## app `gyms`

### Gym
| Champ | Type | Notes |
|---|---|---|
| name | Char | |
| address, city | Char | |
| lat, lng | Float, null | géoloc (distance) |
| rating | Decimal(2,1) | ex 4.9 |
| photo | Image, null | |
| opening_hours | JSON | par jour |
| is_active | Bool | |

`CoachGym` : M2M `coach ↔ gym` (RG-03).

---

## app `catalog`

- **MuscleGroup** : `name`.
- **Injury** : `name` (Aucune / Genou / Épaule / Dos…).
- **Exercise** : `name`, `primary_muscle FK(MuscleGroup)`, `secondary_muscles M2M`,
  `default_sets`, `default_reps`, `default_rest_s`, `charge_hint Char`,
  `equipment Char`, `video_url`, `thumbnail`, `contraindications M2M(Injury)` (RG-12).
- **Tip** : `exercise FK`, `text`, `kind` (error / cue), `order`.

---

## app `programs`

### Program
| Champ | Type | Notes |
|---|---|---|
| member | FK(User) | |
| gym | FK(Gym) | |
| objective, level | Char | snapshot onboarding |
| weekly_freq | Int | |
| version | Int | incrément à chaque recalibrage (RG-11) |
| is_active | Bool | une seule active/membre |
| generated_by | Char | ai / coach |
| summary | Text | ex. « Perdre du poids · intermédiaire · 4 séances/sem. » |

### ProgramDay
`program FK`, `weekday Int|null`, `title Char` (« Pectoraux & Triceps »), `order Int`.

### ExercisePrescription
`program_day FK`, `exercise FK`, `sets Int`, `reps Int`, `charge Char`, `rest_s Int`, `order Int`.

---

## app `workouts`

### WorkoutSession
| Champ | Type | Notes |
|---|---|---|
| member | FK(User) | RG-14 |
| program_day | FK, null | |
| date | DateTime | |
| status | Char | planned / in_progress / done / aborted |
| duration_s | Int | |
| total_volume | Decimal | Σ reps×charge (RG-15) |
| kcal | Int | estimé |

### SetLog
`session FK`, `exercise FK`, `set_index Int`, `reps_done Int`, `charge Char`,
`rest_taken_s Int`, `completed_at DateTime`.

---

## app `groups`

### Group
`coach FK(User)`, `gym FK(Gym)`, `name`, `description`, `capacity Int` (défaut 20, RG-20),
`level Char`, `cover Image|null`, `is_active`.

### GroupMembership
`group FK`, `member FK(User)`, `status` (active/left), `joined_at`. *(Unicité group+member.)*

### GroupSession
| Champ | Type | Notes |
|---|---|---|
| group | FK | |
| title | Char | |
| start_at, end_at | DateTime | start < end (RG-23) |
| capacity | Int | |
| location | Char | |
| status | Char | scheduled / live / done / cancelled |

### SessionEnrollment
`group_session FK`, `member FK`, `status` (enrolled / waitlist / cancelled),
`enrolled_at`. Règles RG-24/25/26. *(Unicité session+member.)*

### Attendance
`group_session FK`, `member FK`, `present Bool`, `validated_by FK(User=coach)`,
`validated_at`. Impacte l'assiduité (RG-27).

---

## app `chat`

### Conversation
`type` (coach_ai / group / direct), `member FK|null` (si coach_ai), `group FK|null` (si group),
`created_at`, `last_message_at`.

### Message
| Champ | Type | Notes |
|---|---|---|
| conversation | FK | |
| sender | FK(User), null | null = IA / système |
| role | Char | user / coach / ai / system |
| text | Text | |
| card | JSON, null | cartes du coach IA (titre + lignes clé/valeur) |
| source | Char, null | claude / simulated (RG-32) |
| read_by | M2M(User) | accusés de lecture |
| created_at | DateTime | |

---

## app `nutrition`
- **Meal** : `member FK`, `photo Image`, `source` (photo/manual), `created_at`.
- **MealAnalysis** (1:1 Meal) : `calories`, `protein_g`, `carbs_g`, `fat_g`,
  `items JSON`, `model_used Char`, `source` (claude/simulated). Premium (RG-34).

---

## app `progress`
- **BodyMetric** : `member FK`, `date`, `weight_kg`, `bmi`, `muscle_pct`, `water_pct`,
  `waist_cm`, `arm_cm`, `chest_cm`, `thigh_cm` *(ou table générique metric_type/value)*.
- **ProgressPhoto** : `member FK`, `photo`, `taken_at`, `label` (before/after/mensuel).

---

## app `subscriptions`
- **Plan** : `name` (Free/Premium), `price`, `currency` (XOF), `features JSON`,
  `ai_daily_quota Int` (RG-31), `max_group_sessions_month Int` (RG-37).
- **Subscription** : `member FK`, `plan FK`, `status` (active/expired/cancelled),
  `started_at`, `ends_at`, `auto_renew`.
- **Payment** : `subscription FK`, `amount`, `method` (mobile_money/card),
  `provider Char`, `status`, `external_ref`. **Modélisé, non branché** (RG-38).

---

## app `notifications`
- **Device** : `user FK`, `expo_token`, `platform` (ios/android), `last_seen`.
- **Notification** : `user FK`, `type`, `title`, `body`, `data JSON`, `is_read`, `created_at` (RG-41).

---

## app `ai`
- **AIRequestLog** : `user FK`, `kind` (program/coach/meal/forecast), `model Char`,
  `prompt_tokens`, `completion_tokens`, `cost_estimate`, `source` (claude/simulated),
  `created_at`. Sert au suivi des quotas (RG-33).

---

## Index & contraintes clés
- `Membership` : contrainte partielle « **un seul `is_current=True`** par user ».
- `Program` : « **un seul `is_active=True`** par member ».
- `SessionEnrollment` : unique `(group_session, member)` ; index sur `status`.
- `Message` : index `(conversation, created_at)`.
- `BodyMetric` : index `(member, date)`.
