# GymAI — Spécification technique

Plateforme fitness **multi-utilisateurs** : réseau **salle ↔ coach ↔ membre**, avec
groupes et séances collectives, coach IA, suivi de progression et temps réel.

**Stack cible**
- **Backend** : Django 5.1 + DRF + PostgreSQL + Redis + **Django Channels** (WebSocket) + Celery + SDK Anthropic
- **Mobile** : **Expo SDK 54** (React Native 0.81 / React 19, expo-router v6, Reanimated v4)

**Décisions actées**
- Coach IA : **API Claude réelle avec repli simulé** automatique
- Abonnement : **modélisé** (Free / Premium), paiement Mobile Money **différé** (post-MVP)
- Temps réel : **Django Channels + Redis** (chat IA, chat groupe, séance live)

## Sommaire

| # | Document | Contenu |
|---|----------|---------|
| 00 | [00-vision-glossaire.md](./00-vision-glossaire.md) | Vision, périmètre, glossaire |
| 01 | [01-regles-gestion.md](./01-regles-gestion.md) | Règles de gestion détaillées |
| 02 | [02-roles-permissions.md](./02-roles-permissions.md) | Rôles & matrice de permissions |
| 03 | [03-modele-donnees.md](./03-modele-donnees.md) | Modèle de données (ERD + champs) |
| 04 | [04-flux-utilisateur.md](./04-flux-utilisateur.md) | Flux complets membre & coach |
| 05 | [05-api-rest.md](./05-api-rest.md) | Endpoints REST |
| 06 | [06-temps-reel-websocket.md](./06-temps-reel-websocket.md) | Channels, consumers, événements |
| 07 | [07-coach-ia.md](./07-coach-ia.md) | Service IA Claude + repli simulé |
| 08 | [08-mobile-expo.md](./08-mobile-expo.md) | Écrans, navigation, animations |
| 09 | [09-architecture-infra.md](./09-architecture-infra.md) | Architecture, infra, sécurité |
| 10 | [10-prerequis-setup.md](./10-prerequis-setup.md) | Prérequis & variables d'environnement |
| 11 | [11-roadmap-sprints.md](./11-roadmap-sprints.md) | Roadmap par sprints |
| 12 | [12-assets-images.md](./12-assets-images.md) | Assets / images nécessaires |

> Statut : **spécification** (aucun code applicatif généré à ce stade). Le scaffold
> backend + mobile sera produit après validation de cette spec.
