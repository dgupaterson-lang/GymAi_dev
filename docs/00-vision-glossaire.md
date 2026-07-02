# 00 — Vision, périmètre & glossaire

## Vision

GymAI connecte trois acteurs autour de l'entraînement :

- le **membre** suit un programme personnalisé par l'IA, logge ses séances et progresse ;
- le **coach** anime des **groupes** et des **séances collectives**, suit ses membres ;
- la **salle** (gérant) structure l'offre (coachs, créneaux, groupes).

Le différenciateur : un **coach IA** disponible 24/7 (programme, analyse, nutrition,
prévision) **+** un **coaching humain** via groupes et séances collectives en temps réel.

## Périmètre

### Inclus (MVP → V1)
- Authentification multi-rôles (membre / coach / gérant / admin), JWT.
- Onboarding IA → génération de programme.
- Dashboard, séance guidée avec chronomètre + annonce vocale, logging des séries.
- **Groupes** + **séances collectives** (inscription, liste d'attente, présence).
- **Chat temps réel** : coach IA (privé) + chat de groupe (WebSocket).
- Suivi de progression (mesures, photos avant/après), nutrition par photo.
- Abonnement Free / Premium **modélisé** (gating des fonctions), paiement différé.
- Notifications push (Expo).
- Thèmes Sombre / Rose.

### Hors périmètre (plus tard)
- Paiement Mobile Money / carte réel (modélisé seulement).
- Marketplace de coachs externes, visioconférence en direct.
- Objets connectés (montres, balances).
- Web app (la base Vite existante pourra devenir un back-office léger).

## Glossaire

| Terme | Définition |
|---|---|
| **Membre** | Utilisateur sportif, consommateur du service |
| **Coach** | Utilisateur qui encadre des membres via des groupes |
| **Gérant** | Responsable d'une salle |
| **Salle (Gym)** | Établissement physique GymAI |
| **Programme** | Plan d'entraînement personnalisé, versionné |
| **Prescription** | Un exercice prévu dans un jour de programme (séries/reps/charge/repos) |
| **Séance loggée (WorkoutSession)** | Exécution réelle d'un entraînement, avec séries enregistrées |
| **Groupe** | Communauté coach + membres rattachée à une salle |
| **Séance collective (GroupSession)** | Cours planifié d'un groupe à un créneau |
| **Inscription (Enrollment)** | Réservation d'une place à une séance collective |
| **Présence (Attendance)** | Validation par le coach de la venue d'un membre |
| **Coach IA** | Assistant conversationnel basé sur l'API Claude (repli simulé) |
| **Quota IA** | Nombre de requêtes IA autorisées selon l'abonnement |
