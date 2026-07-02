# 15 — Contrat d'intégration fronts ↔ backend

Contrat commun suivi **à l'identique** par le web (`web/`) et le mobile (`mobile/`),
extrait du backend réel (app `accounts`). Base : `http://<host>:8000/api/v1`.

## Authentification (JWT SimpleJWT)
- Header authentifié : `Authorization: Bearer <access>`.
- `access` court (15 min), `refresh` (7 j) avec **rotation + blacklist**.

| Méthode | URL | Corps | Réponse |
|---|---|---|---|
| POST | `/auth/register` | `{ email, password, full_name, phone? }` | `201 { id, email, full_name, phone }` (pas de token → enchaîner login) |
| POST | `/auth/login` | `{ email, password }` | `200 { access, refresh, user }` |
| POST | `/auth/refresh` | `{ refresh }` | `200 { access, refresh }` (rotation) |
| POST | `/auth/logout` | `{ refresh }` | `205` (blacklist) |
| GET | `/me` | — | `{ id, email, phone, full_name, role, avatar, is_verified, is_active, date_joined, profile }` |
| PATCH | `/me` | `{ full_name?, phone?, avatar? }` | user mis à jour |
| GET | `/me/profile` | — | profil |
| PATCH | `/me/profile` | `{ accent_color?, theme_mode?, objective?, level?, weekly_freq?, voice_cues?, birthdate?, height_cm? }` | profil mis à jour |

**Objet `user.profile`** : `{ objective, level, weekly_freq, theme_mode ('dark'|'rose'),
accent_color ('#rrggbb'), voice_cues, birthdate, height_cm, created_at, updated_at }`.

## Flux token (client)
1. `login` → stocker `access` + `refresh` (web : `localStorage`; mobile : `expo-secure-store`).
2. Intercepteur requête : injecter `Authorization: Bearer <access>`.
3. Intercepteur réponse `401` : appeler `/auth/refresh` avec le `refresh` →
   - succès : remplacer les tokens, **rejouer** la requête d'origine ;
   - échec : purge tokens → déconnexion (retour Welcome/Login).
   - Anti-boucle : une seule tentative de refresh par requête ; file d'attente des requêtes concurrentes pendant le refresh.
4. `logout` : POST `/auth/logout {refresh}` puis purge locale.

## Synchronisation du thème (couleur personnalisable)
- **Connecté** : à chaque changement de `mode`/`accent` → **PATCH `/me/profile`**
  `{ theme_mode, accent_color }` (débounce ~500 ms). Garder une **copie locale** (offline).
- **Au démarrage connecté** : GET `/me` → hydrater le thème depuis `user.profile`
  (`theme_mode` → mode, `accent_color` → accent).
- **Déconnecté** : comportement actuel (persistance locale uniquement), aucune requête.

## Erreurs
- `400` validation (ex. `accent_color` hors regex `^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$`) → afficher le message.
- `401` → refresh (cf. ci-dessus).
- Réseau indisponible/timeout → **repli gracieux** : ne pas planter, conserver le flux local (démo).

## Configuration
- **Web** (Vite) : `VITE_API_URL` (défaut `http://localhost:8000/api/v1`).
- **Mobile** (Expo) : `EXPO_PUBLIC_API_URL`. En **Expo Go sur téléphone physique**, utiliser
  l'**IP LAN du PC** (ex. `http://192.168.x.x:8000/api/v1`), pas `localhost`.
- Backend : **CORS ouvert en dev** (déjà configuré) — aucune modification requise.

## Comptes de démo (seed_demo)
`admin@email.com` / `admin1234` · `coach@email.com` / `coach1234` · `david@email.com` / `david1234`.
