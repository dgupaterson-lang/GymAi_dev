# 11 — Roadmap par sprints

Découpage indicatif (sprints d'≈ 1–2 semaines). Chaque sprint livre quelque chose de
**démontrable**. Les `RG-xx` renvoient aux règles de gestion (doc 01).

## Sprint 0 — Fondations
- Monorepo, `docker-compose` (postgres+redis), CI lint/tests.
- Backend : projet Django, settings multi-env, `User` custom + rôles, JWT, drf-spectacular.
- Mobile : projet Expo SDK 54, expo-router, thème Dark/Rose (tokens maquette), client axios.
- **Démo** : login factice → Dashboard statique themable.

## Sprint 1 — Auth & onboarding
- Register/verify/login/refresh/logout (RG-01/04/05), `/me`, devices.
- Salles : liste/recherche, choix salle active (RG-02).
- Onboarding (objectif, profil, blessures) + écrans mobiles.
- **Démo** : parcours complet inscription → choix salle → profil enregistré.

## Sprint 2 — Programme & séance
- Catalogue (exercices, muscles, tips, contre-indications RG-12).
- Génération de programme **simulée** d'abord, puis branchée IA (doc 07).
- Séance guidée mobile : vue d'ensemble → détail → set actif (chrono, ±15s, voix RG-16),
  logging `SetLog`, bilan (volume/kcal RG-15).
- **Démo** : faire une séance de bout en bout, historisée.

## Sprint 3 — Coach IA (REST + WebSocket)
- Service `ai` : Claude + **repli simulé** (RG-32), quotas (RG-31/33), tool use (cartes).
- Channels : `CoachAIConsumer`, typing, persistance `Message` (doc 06).
- Chat coach IA mobile (bulles animées, chips, cartes).
- **Démo** : conversation temps réel + bascule simulé si pas de clé.

## Sprint 4 — Groupes & séances collectives
- CRUD groupes (RG-20/22), adhésion (RG-21).
- Séances collectives : planification, inscription/liste d'attente (RG-24/25/26),
  présences (RG-27), machine à états (doc 04-F).
- `GroupChatConsumer` + chat de groupe mobile (RG-28).
- Beat : rappels T-2h (RG-41), promotion waitlist (RG-25).
- **Démo** : coach crée un groupe + séance, membres s'inscrivent, chat live, présences.

## Sprint 5 — Progression & nutrition
- Mesures (R/W membre, R coach RG-42), photos avant/après, graphe de poids.
- Dashboard agrégé (anneaux, stats) via `/dashboard`.
- Nutrition : photo repas → macros IA (Premium RG-34).
- **Démo** : profil complet, courbes, analyse repas.

## Sprint 6 — Abonnement, notifications, finitions
- Plans Free/Premium, gating des fonctions (RG-35/36/37), octroi admin (RG-38).
- Push Expo (rappels, messages, place libérée, présence) + deep links.
- Animations finales (stagger, Lottie, transitions), accessibilité, polish thèmes.
- **Démo** : app complète, multi-rôles, temps réel, notifications.

## Sprint 7 — Durcissement & livraison
- Sécurité (throttling, URLs signées RG-43, audit permissions), Sentry, perfs (cache, N+1).
- Tests e2e, données de démo, documentation.
- Builds **EAS** iOS/Android, environnement staging.

## Post-MVP (backlog)
- Paiement Mobile Money / carte réel (CinetPay/Paystack) — `Payment` déjà modélisé.
- Back-office web (réutiliser la base Vite existante).
- Visio séance, objets connectés, marketplace coachs.
