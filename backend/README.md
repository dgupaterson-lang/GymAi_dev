# GymAI — Backend (Django 5.1 + DRF)

API REST de la plateforme fitness GymAI. Sprint 0 : `accounts` (auth JWT, profil)
est complet ; les autres apps sont enregistrées et seront modélisées ensuite.

## Prérequis

- Python 3.12
- (Optionnel) Docker + Compose pour Postgres 16 / Redis 7

En DEV, **sans `DATABASE_URL`**, le projet utilise **SQLite** : runnable sans Docker.

## Démarrage rapide (Windows / PowerShell)

```powershell
cd backend

# 1) Environnement virtuel
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2) Dépendances
pip install -r requirements.txt

# 3) Configuration (copier l'exemple)
Copy-Item .env.example .env

# 4) Migrations (SQLite par défaut)
python manage.py makemigrations
python manage.py migrate

# 5) Données de démo (admin, coach, David, 3 salles)
python manage.py seed_demo

# 6) Lancer le serveur
python manage.py runserver 0.0.0.0:8000
```

> Si l'activation est bloquée par la politique d'exécution PowerShell :
> `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

## Postgres / Redis via Docker (optionnel)

Depuis la racine `GymAI/` :

```powershell
docker compose up -d db redis
```

Puis dans `backend/.env`, décommenter :

```
DATABASE_URL=postgres://gymai:gymai@localhost:5432/gymai
```

## Comptes de démo (après `seed_demo`)

| Rôle   | Email             | Mot de passe |
|--------|-------------------|--------------|
| admin  | admin@email.com   | admin1234    |
| coach  | coach@email.com   | coach1234    |
| member | david@email.com   | david1234    |

## Endpoints principaux (base `/api/v1/`)

| Méthode      | URL                  | Description                              |
|--------------|----------------------|------------------------------------------|
| POST         | `/auth/register`     | Crée un compte (membre par défaut)       |
| POST         | `/auth/login`        | access + refresh + user                  |
| POST         | `/auth/refresh`      | Rafraîchit l'access                      |
| POST         | `/auth/logout`       | Blackliste le refresh                    |
| GET / PATCH  | `/me`                | Utilisateur courant (+ profil imbriqué)  |
| GET / PATCH  | `/me/profile`        | Préférences (accent_color, theme_mode…)  |

Documentation auto :

- Schéma OpenAPI : `/api/schema/`
- Swagger UI : `/api/docs/`

## Vérifications

```powershell
python manage.py check
python manage.py test
```

## Notes

- `accent_color` est validé par regex `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$` (défaut `#5fe3f0`).
- `theme_mode` ∈ {`dark`, `rose`} (défaut `dark`).
- Le `Profile` est créé automatiquement à la création d'un `User` (signal `post_save`).
- Celery / Channels / Redis sont configurés mais non exploités au Sprint 0.
