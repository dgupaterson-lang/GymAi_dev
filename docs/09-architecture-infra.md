# 09 — Architecture & infrastructure

## Vue d'ensemble

```
                 ┌─────────────────────────── Mobile (Expo SDK 54) ───────────────────────────┐
                 │  expo-router · React Query · Zustand · Reanimated · WebSocket · Expo Push   │
                 └───────────────┬───────────────────────────────────┬────────────────────────┘
                          HTTPS (REST)                         WSS (Channels)
                                 │                                     │
                 ┌───────────────▼─────────────────────────────────────▼───────────────┐
                 │                         Backend (ASGI — Daphne/Uvicorn)              │
                 │   Django 5.1 + DRF (REST)        Django Channels (WebSocket)         │
                 │   SimpleJWT · drf-spectacular     consumers (coach IA, groupes…)     │
                 └───────┬───────────────┬───────────────────┬──────────────┬──────────┘
                         │               │                   │              │
                   PostgreSQL 16      Redis 7            Celery workers   Service IA
                   (données)      (cache, pub/sub,       (génération,    (SDK Anthropic
                                   queues Celery,         IA, push,        + repli simulé)
                                   channel layer)         analyses)
                         │
                  Stockage médias : local (dev) / S3-R2 (prod, URLs signées)
                                              │
                              Expo Push Notifications (FCM/APNs)
```

## Composants

| Composant | Rôle | Techno |
|---|---|---|
| API REST | CRUD, auth, agrégats | Django + DRF |
| Temps réel | chat IA, groupes, séance live, notifs in-app | Channels + channels-redis |
| Tâches asynchrones | génération programme, appels IA, push, analyse repas | Celery + Redis |
| Planifié | rappels séance (T-2h), nettoyage, stats | Celery Beat |
| Base de données | persistance | PostgreSQL 16 |
| Cache / broker / channel layer | perf, files, pub/sub | Redis 7 |
| Médias | photos, démos | FS local (dev) / S3 ou Cloudflare R2 (prod) |
| Push | notifications mobiles | Expo Push API |
| Observabilité | logs, erreurs, métriques | Sentry + logs structurés |

## Tâches Celery (principales)
- `generate_program(member_id, params)` → crée le programme actif, notifie.
- `recalibrate_program(program_id, params)` → version+1.
- `coach_ai_reply(conversation_id, message_id)` → appelle le service IA, diffuse via Channels.
- `analyze_meal(meal_id)` → vision → macros.
- `send_push(user_id, payload)` → Expo Push.
- **Beat** : `send_session_reminders()` (toutes les 5 min, fenêtre T-2h),
  `promote_waitlist(session_id)` (sur annulation, RG-25), `expire_subscriptions()`.

## Environnements
| Env | Description |
|---|---|
| **dev** | Docker Compose (postgres + redis) ; Django runserver/Daphne ; Expo Go |
| **staging** | image conteneur, base gérée, Redis géré, médias S3 |
| **prod** | idem staging + scaling workers, CDN médias, sauvegardes |

`docker-compose.yml` (dev) : services `db` (postgres:16), `redis` (redis:7),
`backend` (web ASGI), `worker` (celery), `beat` (celery beat).

## Sécurité
- HTTPS/WSS partout ; HSTS.
- JWT courts + refresh rotatif **blacklisté** ; secrets via variables d'env (jamais commit).
- Permissions **objet par objet** (doc 02) ; cloisonnement par salle/membre (RG-40).
- Rate limiting (DRF throttling) ; throttle spécifique sur l'IA (quotas, RG-31) et l'auth.
- Upload : validation type/taille, scan basique, noms aléatoires, **URLs signées** (RG-43).
- Anti prompt-injection côté IA (doc 07) ; CORS restreint aux origines connues.
- RGPD-like : export/suppression des données d'un membre sur demande.

## Performance & scalabilité
- Pagination + `select_related/prefetch_related` (éviter N+1).
- Cache Redis pour le `dashboard` et les listes de salles/exercices.
- Index DB ciblés (doc 03).
- Workers Celery et instances ASGI **scalables horizontalement** (état dans Redis/DB).
- Channel layer Redis → plusieurs instances ASGI partagent les groupes WS.

## CI/CD (cible)
- Lint + tests (pytest/DRF, Jest/RN) sur PR.
- Build images backend, build EAS mobile sur tag.
- Migrations automatiques contrôlées au déploiement.
