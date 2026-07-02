# 14 — Coach ↔ sportifs : programmes coachés, invitations & vidéos locales

Extension métier demandée : interactions coach → adhérents, programmes/défis suivis
sur une période (ex. 1 mois), invitations qui **poussent au téléchargement**, et
enregistrement de **vidéos de démonstration stockées uniquement sur l'appareil**
(jamais sur nos serveurs), utilisables hors-ligne pour s'entraîner chez soi.

---

## 1. Concepts nouveaux

| Concept | Définition |
|---|---|
| **Programme coaché** | Programme **créé par un coach**, partageable, borné dans le temps (défaut **30 jours**). Différent du programme perso généré par l'IA. |
| **Adhésion** | Inscription d'un sportif à un programme coaché (ou groupe), avec date de début/fin et **suivi d'assiduité**. |
| **Invitation** | Message/lien envoyé par le coach pour rejoindre un groupe ou un programme coaché — vers un membre **ou** vers un non-membre (→ téléchargement). |
| **Défi / cycle** | Période de suivi (ex. 1 mois) avec **bilan** à l'échéance. |
| **Vidéo locale** | Clip de démonstration filmé dans l'app, **stocké dans le stockage local du téléphone** (cache/fichiers), hors serveurs. |

---

## 2. Règles de gestion (RG-50+)

### Programmes coachés & adhésions
- **RG-50** Un **coach** peut créer un **programme coaché** partageable (titre, description, `duration_days` défaut 30, jours & exercices), distinct du programme perso IA.
- **RG-51** Un coach **invite** des sportifs à rejoindre un **groupe** ou un **programme coaché**.
- **RG-52** Une **adhésion** a une **date de début** et une **date de fin** (`start + duration_days`) ; le **suivi d'assiduité** (séances faites / prévues) est visible du coach **et** de l'adhérent.
- **RG-53** À l'échéance, un **bilan de cycle** est produit (assiduité, progression, reco IA) ; le coach peut relancer un nouveau cycle.
- **RG-54** Un membre peut adhérer à **plusieurs** programmes coachés ; un coach suit la **liste de ses adhérents** et leur avancement.
- **RG-55** Le coach ne peut créer/partager des programmes que pour **ses salles** (cf. RG-03).

### Invitations & croissance (téléchargements)
- **RG-56** Une invitation cible soit un **membre existant** (notif in-app), soit un **contact externe** (téléphone/e-mail/lien/QR) → **incite au téléchargement**.
- **RG-57** Une invitation a un **statut** (`pending / accepted / expired`), une **date d'expiration**, et un **lien profond** (deep link) avec **repli vers le store** si l'app n'est pas installée.
- **RG-58** Un non-membre qui ouvre le lien est guidé : installer → créer un compte → **auto-inscription** au groupe/programme cible (deferred deep link).
- **RG-59** Le coach voit le **taux de conversion** de ses invitations (envoyées → installées → inscrites) — indicateur de croissance.
- **RG-60** Les liens d'invitation sont **à usage limité** (expiration, révocables) pour éviter les abus.

### Vidéos de démonstration (stockage local, vie privée)
- **RG-61** L'app permet d'**enregistrer des vidéos** de démonstration ; elles sont stockées **uniquement dans le stockage local de l'appareil** (cache/fichiers), **jamais téléversées** sur les serveurs GymAI.
- **RG-62** Ces vidéos sont **consultables hors-ligne**, pour s'entraîner à domicile.
- **RG-63** **Consentement obligatoire** : filmer une personne (le coach) exige un accord explicite dans l'app (case à cocher) avant l'enregistrement ; la vidéo reste **privée sur l'appareil**.
- **RG-64** **Gestion du cache** : quota local configurable, **avertissement d'espace**, purge manuelle ; l'utilisateur peut **supprimer** ses vidéos à tout moment.
- **RG-65** **Aucune** vidéo n'est indexée côté serveur. Seules d'éventuelles **métadonnées non personnelles** (titre, durée, exercice lié) restent **locales**.
- **RG-66** À la désinstallation de l'app / vidage du cache système, les vidéos peuvent être perdues : l'utilisateur en est **averti** (pas de sauvegarde cloud par conception).

---

## 3. Modèle de données

### Côté backend (nouveaux / étendus)
- **Program** (étendu) : `owner_coach FK(User, null)`, `kind` ∈ {`personal`, `coach_shared`}, `is_template Bool`, `is_shared Bool`, `duration_days Int` (défaut 30).
- **ProgramEnrollment** *(adhésion)* : `member FK`, `program FK(coach_shared)`, `start_date`, `end_date`, `status` ∈ {active, completed, dropped}, `sessions_done Int`, `sessions_target Int`. *(Unicité `member+program+start_date`.)*
- **Invitation** : `from_coach FK`, `kind` ∈ {group, program}, `group FK(null)`, `program FK(null)`, `target_type` ∈ {member, contact}, `member FK(null)`, `contact Char(null)` (tél/e-mail), `token` (unique), `status`, `expires_at`, `accepted_by FK(null)`, `created_at`.
- **CycleReview** *(bilan de cycle)* : `enrollment FK`, `period_start/end`, `adherence_pct`, `summary Text` (généré par l'IA, doc 07).

### Côté mobile — **local uniquement** (aucun modèle serveur)
- **LocalVideo** (via `expo-file-system` + index `expo-sqlite`/AsyncStorage) :
  `{ id, uri (chemin local), title, exercise_ref?, duration_s, size_bytes, consent: true, created_at }`.
- Bibliothèque « **Mes démos** » : liste locale, lecture hors-ligne, suppression, indicateur d'espace utilisé.

> Contrainte clé : `LocalVideo` **n'a pas** de représentation serveur. L'API ne stocke ni
> ne référence ces fichiers (RG-61/65).

---

## 4. Flux

### Coach → adhérents (programme coaché sur 1 mois)
```
Coach : "Créer un programme coaché" (titre, 30 j, jours/exos)
   → "Inviter" : sélection de membres OU génération d'un lien/QR partageable
Sportif (membre) : notif → "Rejoindre" → adhésion (start today, end +30 j)
Sportif (non-membre) : lien → store → install → compte → auto-inscription
Pendant 30 j : suivi d'assiduité (coach voit tous les adhérents ; l'adhérent voit sa barre)
Échéance : bilan de cycle (assiduité, progression) → relancer un cycle ?
```

### Invitation externe (moteur de téléchargement)
```
Lien d'invitation (deep link + token)
 ├─ App installée   → ouverture directe sur l'écran d'adhésion
 └─ App absente     → store (iOS/Android) → après install → deferred deep link → adhésion
Coach : tableau de conversion (envoyées / installées / inscrites)  (RG-59)
```

### Vidéo locale (démonstration hors-ligne)
```
"Filmer une démo" → consentement (RG-63) → enregistrement (expo-camera)
   → sauvegarde LOCALE (expo-file-system)  [jamais d'upload]
   → apparaît dans "Mes démos" (local)
À domicile (hors-ligne) : lecture de la démo pendant la séance guidée
Gestion : espace utilisé, suppression, quota (RG-64)
```

---

## 5. Aspects techniques

- **Deep linking** : `expo-router` (universal links iOS / app links Android) + schéma `gymai://`.
  Le **deferred deep link** (installer PUIS ouvrir sur la bonne cible) nécessite un service
  d'attribution (ex. lien intelligent) — **décision d'outil à prendre** le moment venu.
- **Partage de lien/QR** : `expo-sharing` + génération de QR ; le lien encode `token` (RG-57).
- **Caméra/stockage** : `expo-camera` (capture), `expo-file-system` (fichiers), `expo-video`
  (lecture), `expo-sqlite`/AsyncStorage (index local). **Aucun** endpoint d'upload créé.
- **Confidentialité by design** : les vidéos ne quittent pas l'appareil → pas de coût de
  stockage serveur, contenu du coach protégé, conformité vie privée simplifiée.

---

## 6. Décision actée — bibliothèque personnelle locale

Modèle retenu : **« chacun filme les siennes »**. Chaque utilisateur (adhérent comme coach)
enregistre ses propres démos, gardées **uniquement sur son appareil**. **Aucun transfert**
entre utilisateurs, **aucun pair-à-pair**, **aucun serveur**.

- L'adhérent qui veut s'entraîner à domicile **filme lui-même** la démo (par ex. le coach en
  séance, avec son consentement RG-63), et la **rejoue hors-ligne** chez lui.
- Conséquences : architecture vidéo **100 % côté mobile**, **zéro endpoint** d'upload/partage,
  vie privée maximale, coût serveur nul. Cette piste est **indépendante du backend** et peut
  être développée en parallèle.
- Évolution possible plus tard (hors scope) : export manuel via le partage natif du système
  (l'utilisateur reste maître du fichier).

---

## 7. Impact roadmap
- **S2** : programmes coachés + adhésions + suivi 30 j (backend + fronts).
- **S2/S4** : invitations + deep links + tableau de conversion (croissance).
- **Piste mobile indépendante** : vidéos locales (aucune dépendance backend → réalisable
  en parallèle du branchement fronts↔backend).
