# GymAI — plateforme fitness avec coach IA

Implémentation **React + Vite + TypeScript** de la maquette `GymAI.dc.html`
(exportée depuis Claude Design). L'app reproduit au pixel près le prototype mobile :
parcours d'inscription, onboarding IA, tableau de bord, séance guidée avec
chronomètre, coach IA conversationnel et profil.

## Démarrer

```bash
npm install
npm run dev
```

Ouvre ensuite l'URL affichée (par défaut http://localhost:5173).

```bash
npm run build     # build de production dans dist/
npm run preview   # prévisualise le build
```

## Écrans

| Écran | Fichier |
|-------|---------|
| Accueil (welcome + sélecteur d'ambiance) | `src/screens/Welcome.tsx` |
| Connexion | `src/screens/Login.tsx` |
| Choix de la salle | `src/screens/GymPicker.tsx` |
| Onboarding IA (objectif → profil → génération) | `src/screens/Onboarding.tsx` |
| Tableau de bord | `src/screens/Home.tsx` |
| Séance — vue d'ensemble | `src/screens/WorkoutOverview.tsx` |
| Détail d'un exercice | `src/screens/ExerciseDetail.tsx` |
| Set actif / chronomètre de repos | `src/screens/ActiveSet.tsx` |
| Coach IA (chat) | `src/screens/Coach.tsx` |
| Profil | `src/screens/Profile.tsx` |
| Navigation à onglets | `src/screens/BottomNav.tsx` |

## Architecture

- **`src/useGymApp.ts`** — porte la logique de la maquette (machine à états du
  parcours, navigation, minuteur de repos avec annonce vocale, génération du
  programme, chat du coach). Équivalent React de la classe `DCLogic` d'origine.
- **`src/theme.ts`** — les deux ambiances (Sombre / Rose) exposées en variables CSS.
- **`src/data.ts`** — exercices, salles et réponses contextuelles du coach IA.
- **`src/lib/style.ts`** — utilitaire `s()` qui convertit les styles inline de la
  maquette en objets de style React (fidélité au pixel près).
- **`src/Icon.tsx`** — composant icône Material Symbols Rounded.
- **`src/api/`** — intégration backend : `client.ts` (instance axios, injection du
  token, refresh JWT automatique sur 401 avec file d'attente), `auth.ts`
  (`register`/`login`/`refresh`/`logout`/`getMe`/`patchProfile`), `tokens.ts`
  (stockage localStorage des tokens), `types.ts` (contrat d'API).
- **`src/store/auth.ts`** — store d'auth réactif (`user`, `isAuthenticated`,
  `login`/`register`/`logout`/`bootstrap`) exposé via le hook `useAuth`.

## Intégration backend (auth JWT + thème synchronisé)

L'app se connecte à l'API GymAI (app `accounts`). Configuration via Vite :

```bash
cp .env.example .env      # puis ajuste VITE_API_URL si besoin
```

| Variable | Défaut | Rôle |
|----------|--------|------|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Base de l'API backend |

Comportement :

- **Connexion / inscription** : l'écran `Login.tsx` appelle réellement
  `POST /auth/login` (ou `register` + auto-login). Au succès, les tokens sont
  stockés (`gymai.access` / `gymai.refresh`) et le thème est hydraté depuis
  `user.profile` (`theme_mode` → mode, `accent_color` → accent).
- **Refresh automatique** : un `401` déclenche un unique `POST /auth/refresh`
  (rotation), rejoue la requête, et met en file les requêtes concurrentes. En cas
  d'échec, les tokens sont purgés et l'utilisateur est déconnecté.
- **Synchro du thème** : connecté, tout changement de mode/accent est envoyé en
  `PATCH /me/profile` **débouncé (~500 ms)** ; le `localStorage` (`gymai.theme`)
  reste le cache offline.
- **Repli gracieux** : si l'API est injoignable (timeout/refus), l'app **ne plante
  pas** — le parcours de démo local reste utilisable (un `console.warn` le signale).

Comptes de démo (seed backend) : `david@email.com` / `david1234`,
`coach@email.com` / `coach1234`, `admin@email.com` / `admin1234`.

## Détails fidèles à la maquette

- 2 thèmes complets commutables (Accueil et Profil).
- Chronomètre de repos animé (anneau SVG), boutons ±15 s, « passer le repos »,
  vibration + annonce vocale (`SpeechSynthesis` en `fr-FR`) en fin de repos.
- Coach IA avec réponses contextuelles et cartes (perte de poids, programme,
  analyse, prévision, nutrition).
- Polices Space Grotesk + Hanken Grotesk, icônes Material Symbols (chargées via
  Google Fonts dans `index.html`).

> Le contenu de l'app (exercices, coach IA, mensurations) reste en démonstration,
> mais l'**authentification** et la **synchronisation du thème** passent désormais
> par l'API backend réelle (voir la section « Intégration backend » ci-dessus).
> Sans backend accessible, l'app reste utilisable en mode démo local.
