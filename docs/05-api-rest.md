# 05 — API REST

Base : `/api/v1/`. Auth : `Authorization: Bearer <access>`. Format : JSON.
Pagination : `?page=&page_size=` (défaut 20). Doc auto : **drf-spectacular** → `/api/schema/` + `/api/docs/`.

Codes : `200/201` succès · `204` suppression · `400` validation · `401` non authentifié ·
`403` permission · `404` introuvable · `409` conflit (RG) · `429` quota IA dépassé.

## Auth & comptes
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Crée un compte (membre par défaut) |
| POST | `/auth/verify` | public | Vérifie e-mail/OTP (RG-05) |
| POST | `/auth/login` | public | Renvoie access + refresh |
| POST | `/auth/refresh` | public | Rafraîchit l'access |
| POST | `/auth/logout` | auth | Blackliste le refresh |
| GET/PATCH | `/me` | auth | Profil courant (User + Profile) |
| GET | `/me/profile` · PATCH | member | Préférences (objectif, thème, voice_cues…) |
| POST | `/devices` | auth | Enregistre un token push Expo |

## Salles & appartenance
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| GET | `/gyms?search=&near=lat,lng` | auth | Liste/recherche salles (distance, rating) |
| GET | `/gyms/{id}` | auth | Détail salle |
| GET | `/memberships` | auth | Mes appartenances |
| POST | `/memberships` | member | Rejoindre/définir la salle active (RG-02) |

## Catalogue
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| GET | `/exercises?muscle=&injury_safe=` | auth | Exercices (filtre blessures RG-12) |
| GET | `/exercises/{id}` | auth | Détail (muscles, tips, vidéo) |

## Programmes
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| POST | `/programs/generate` | member | Génère le programme actif (IA, RG-10) — async |
| GET | `/programs/active` | member | Programme actif + jours + prescriptions |
| GET | `/programs/{id}` | owner/coach | Détail (versions) |
| POST | `/programs/{id}/recalibrate` | member/coach | Nouvelle version (RG-11) — async |

## Séances (logging)
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| POST | `/workouts` | member | Démarre une séance (program_day) |
| GET | `/workouts?from=&to=` | owner/coach | Historique |
| GET | `/workouts/{id}` | owner/coach | Détail + SetLogs |
| POST | `/workouts/{id}/sets` | owner | Logge une série (SetLog, RG-15) |
| PATCH | `/workouts/{id}` | owner | Met à jour le statut (done/aborted) |

## Groupes & séances collectives
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| GET | `/groups?gym=&mine=true` | auth | Groupes (de ma salle / les miens) |
| POST | `/groups` | coach/manager | Créer (RG-22) |
| GET/PATCH/DELETE | `/groups/{id}` | owner/manager | Gérer |
| POST | `/groups/{id}/join` | member | Rejoindre (RG-21) |
| POST | `/groups/{id}/leave` | member | Quitter |
| GET | `/groups/{id}/members` | owner/manager | Membres |
| GET | `/groups/{id}/sessions?upcoming=true` | member+ | Séances collectives |
| POST | `/groups/{id}/sessions` | owner/manager | Planifier (RG-23) |
| PATCH | `/sessions/{id}` | owner/manager | Éditer / changer statut |
| POST | `/sessions/{id}/cancel` | owner/manager | Annuler (notifie) |
| POST | `/sessions/{id}/enroll` | member | S'inscrire (RG-24/26) |
| DELETE | `/sessions/{id}/enroll` | member | Annuler son inscription (RG-25) |
| GET | `/sessions/{id}/enrollments` | owner/manager | Inscrits + liste d'attente |
| POST | `/sessions/{id}/attendance` | owner | Valider présences (RG-27) |

## Chat (REST = historique ; live = WebSocket, voir doc 06)
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| GET | `/conversations` | auth | Mes conversations (IA + groupes) |
| GET | `/conversations/{id}/messages?before=` | membre conv | Historique paginé |
| POST | `/conversations/coach-ai/messages` | member | Envoi au coach IA (REST fallback ; RG-30/31/32) |
| POST | `/groups/{id}/messages` | membre groupe | Message de groupe (REST fallback) |

## Nutrition (Premium)
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| POST | `/meals` | member(Premium) | Upload photo repas → analyse async (RG-34) |
| GET | `/meals?from=&to=` | owner | Historique repas + macros |

## Progression
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| GET/POST | `/metrics` | owner | Mesures corporelles (RG-42) |
| GET | `/metrics/weight-series?days=30` | owner/coach(R) | Série pour le graphe |
| GET/POST | `/photos` | owner | Photos avant/après |
| GET | `/dashboard` | member | Agrégat dashboard (programme du jour, anneaux, stats) |

## Abonnement
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| GET | `/plans` | auth | Plans Free/Premium |
| GET | `/subscriptions/me` | member | Mon abonnement |
| POST | `/admin/subscriptions/grant` | admin/manager | Octroyer Premium (RG-38) |

## Notifications
| Méthode | URL | Rôle | Description |
|---|---|---|---|
| GET | `/notifications?unread=true` | auth | Liste |
| POST | `/notifications/{id}/read` | auth | Marquer lu |

## Exemples de payload

**POST `/programs/generate`**
```json
{ "objective": "Perdre du poids", "level": "Intermédiaire", "weekly_freq": 4, "injuries": ["Genou"] }
→ 202 { "task_id": "…", "status": "generating" }
```

**POST `/workouts/{id}/sets`**
```json
{ "exercise": 12, "set_index": 0, "reps_done": 10, "charge": "60 kg", "rest_taken_s": 90 }
→ 201
```

**POST `/sessions/{id}/enroll`** → `201 {"status":"enrolled"}` · `409 {"detail":"Séance pleine","status":"waitlist","position":3}` · `409 {"detail":"Inscriptions closes"}`

**POST `/conversations/coach-ai/messages`**
```json
{ "text": "Je veux perdre 8 kg" }
→ 201 { "reply": { "text": "…", "card": { "title": "Plan ajusté", "rows": [["Fréquence","4 séances / sem."]] }, "source": "claude" } }
→ 429 { "detail": "Quota IA quotidien atteint", "reset_at": "…" }
```
