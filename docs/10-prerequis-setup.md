# 10 — Prérequis & configuration

## Outils à installer

| Outil | Version | Usage |
|---|---|---|
| Node.js | **20 LTS+** | mobile (Expo), tooling |
| npm / pnpm | récent | gestion paquets mobile |
| Python | **3.12** | backend Django |
| PostgreSQL | **16** | base de données |
| Redis | **7** | cache, Celery, Channels |
| Docker + Compose | récent | env dev reproductible (db+redis) |
| Git | récent | versionnage |
| Expo Go | dernière (SDK 54) | exécuter l'app sur téléphone |
| Compte Expo / EAS | gratuit | builds, notifications push |
| Clé API Anthropic | — | coach IA réel (sinon mode simulé) |

> Astuce : sur Windows, le plus simple est **PostgreSQL + Redis via Docker**.
> Téléphone et PC **sur le même réseau Wi-Fi** pour tester via Expo Go.

## Comptes / accès nécessaires
- Compte **Expo** (push + builds EAS).
- Compte **Anthropic** + `ANTHROPIC_API_KEY` (optionnel : sans clé → coach simulé).
- (Prod) stockage **S3 / Cloudflare R2** + **Sentry**.

## Variables d'environnement — backend (`backend/.env`)
```
# Django
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
# Base de données
DATABASE_URL=postgres://gymai:gymai@localhost:5432/gymai
# Redis
REDIS_URL=redis://localhost:6379/0
# JWT
JWT_ACCESS_MIN=15
JWT_REFRESH_DAYS=7
# IA (doc 07)
ANTHROPIC_API_KEY=
AI_CHAT_MODEL=claude-sonnet-4-6
AI_PROGRAM_MODEL=claude-opus-4-8
AI_TIMEOUT_S=20
AI_FREE_DAILY_QUOTA=10
# Médias / stockage (prod)
MEDIA_BACKEND=local            # local | s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_ENDPOINT_URL=
# Expo push
EXPO_ACCESS_TOKEN=
# Observabilité
SENTRY_DSN=
```

## Variables d'environnement — mobile (`mobile/.env` via `app.config`)
```
EXPO_PUBLIC_API_URL=http://<IP_LOCALE_DU_PC>:8000/api/v1
EXPO_PUBLIC_WS_URL=ws://<IP_LOCALE_DU_PC>:8000/ws
EXPO_PUBLIC_SENTRY_DSN=
```
> Utiliser l'**IP locale** du PC (pas `localhost`) pour qu'Expo Go y accède depuis le téléphone.

## Démarrage local (après scaffold — pour mémoire)
```bash
# Infra
docker compose up -d db redis

# Backend
cd backend
python -m venv .venv && . .venv/Scripts/activate     # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo        # données de démo (salles, exercices, coach)
python manage.py runserver 0.0.0.0:8000
# (autres terminaux)
celery -A config worker -l info
celery -A config beat -l info

# Mobile
cd ../mobile
npm install
npx expo start
```

## Données de démo (`seed_demo`)
Reprend la maquette : 3 salles (Plateau, Cocody, Marcory), exercices (Développé couché,
Écarté poulie, Dips lestés, Extension triceps), 1 coach + 1 groupe, 1 membre « David ».
