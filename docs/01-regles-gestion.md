# 01 — Règles de gestion

Identifiant `RG-xx` réutilisé dans les specs API et les tests.

## Comptes & salles
- **RG-01** Un compte a exactement **un rôle principal** : `member`, `coach`, `manager` ou `admin`.
- **RG-02** Un **membre** a **une salle active** à la fois ; l'historique des appartenances est conservé.
- **RG-03** Un **coach** est rattaché à **≥ 1 salle** ; il ne voit que les membres/groupes de ses salles.
- **RG-04** L'e-mail est unique et sert d'identifiant de connexion ; le téléphone est optionnel mais unique s'il est renseigné.
- **RG-05** Un compte doit être **vérifié** (e-mail ou OTP) avant d'accéder à l'onboarding.

## Programme & séances
- **RG-10** À l'onboarding, un **programme actif** est généré à partir de : objectif, niveau, fréquence hebdo, blessures.
- **RG-11** Un membre a **un seul programme actif** ; le recalibrage crée une **nouvelle version** (l'ancienne est archivée).
- **RG-12** Les **blessures** déclarées **excluent** les exercices contre-indiqués correspondants.
- **RG-13** La fréquence hebdo est bornée : **2 ≤ freq ≤ 6**.
- **RG-14** Une **séance loggée** ne peut être démarrée que pour un jour de programme du membre **lui-même**.
- **RG-15** À la fin d'un exercice, le **tonnage** (Σ séries×reps×charge), la **durée** et les **kcal estimées** sont calculés et stockés.
- **RG-16** L'**annonce vocale** de fin de repos s'active selon la préférence `voice_cues` du profil.

## Groupes & séances collectives
- **RG-20** Un **groupe** = 1 coach propriétaire + N membres + 1 salle ; **capacité max** configurable (défaut 20).
- **RG-21** Un membre peut appartenir à **plusieurs groupes** ; un coach peut animer **plusieurs groupes**.
- **RG-22** Seul le **coach propriétaire** (ou un gérant de la salle) peut éditer un groupe ou planifier ses séances.
- **RG-23** Une **séance collective** a un créneau (`start_at` < `end_at`), une capacité et un statut : `scheduled → live → done` (ou `cancelled`).
- **RG-24** L'**inscription** est ouverte jusqu'à **T-30 min** et limitée à la capacité ; au-delà, le membre passe en **liste d'attente**.
- **RG-25** À l'annulation d'une inscription, la **1ʳᵉ place de la liste d'attente** est promue automatiquement + notification (RG-41).
- **RG-26** Un membre ne peut pas s'inscrire à **deux séances qui se chevauchent**.
- **RG-27** La **présence** est validée par le coach pendant/à la fin de la séance ; elle impacte le **score d'assiduité**.
- **RG-28** Seul un membre du groupe peut lire/écrire dans le **chat du groupe**.

## Coach IA & quotas
- **RG-30** Le **chat coach IA** est **privé** (un membre = sa conversation).
- **RG-31** Quota IA : **Free = N requêtes/jour** (défaut 10), **Premium = illimité** (configurable côté `Plan`).
- **RG-32** En cas d'indisponibilité de l'API Claude (erreur/quota/clé absente), bascule **automatique** sur le moteur **simulé** ; la réponse est marquée `source = simulated`.
- **RG-33** Les requêtes IA sont **journalisées** (modèle, tokens, coût estimé) pour le suivi des quotas.
- **RG-34** L'analyse de repas par photo est **réservée Premium** (RG-36).

## Abonnement
- **RG-35** Deux plans : **Free** (par défaut à l'inscription) et **Premium**.
- **RG-36** Premium débloque : analyse repas photo, prévisions, **séances collectives illimitées**, historique complet, IA illimitée.
- **RG-37** Free limite : X séances collectives/mois (défaut 4), quota IA quotidien, historique 30 jours.
- **RG-38** Le paiement est **modélisé** (`Payment`) mais **non branché** au MVP ; un Premium peut être octroyé par un admin.

## Confidentialité & notifications
- **RG-40** Un membre ne lit **jamais** les données (mesures, photos, chat IA) d'un autre membre.
- **RG-41** Notifications déclenchées : rappel séance (T-2h), fin de repos, nouveau message coach/groupe, place libérée, présence validée.
- **RG-42** Les **mesures et photos** d'un membre sont **lecture seule** pour le coach et **privées par défaut**.
- **RG-43** Toute donnée médias (photos) est servie via URLs **signées/à durée limitée** en production.
