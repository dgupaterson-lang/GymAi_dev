# 08 — Mobile (Expo SDK 54)

**Expo SDK 54** — React Native 0.81 / React 19, **New Architecture** activée par défaut,
**expo-router v6** (navigation par fichiers). Initialisation : `npx create-expo-app@latest`.

## Dépendances clés
| Domaine | Paquet |
|---|---|
| Navigation | `expo-router` |
| Données serveur | `@tanstack/react-query` |
| État local | `zustand` |
| HTTP | `axios` (intercepteur JWT + refresh) |
| Temps réel | WebSocket natif + hook `useSocket` (reconnexion/backoff) |
| Animations | `react-native-reanimated` (v4), `react-native-gesture-handler`, `moti` |
| Dessin/anneaux | `react-native-svg` (+ `@shopify/react-native-skia` si besoin) |
| Voix / haptique | `expo-speech` (fr-FR), `expo-haptics` |
| Lottie | `lottie-react-native` |
| Médias | `expo-image`, `expo-image-picker`, `expo-camera` |
| Sécurité | `expo-secure-store` (tokens) |
| Push | `expo-notifications` |
| Polices | `@expo-google-fonts/space-grotesk`, `@expo-google-fonts/hanken-grotesk`, icônes Material Symbols |

## Arborescence expo-router (`mobile/app/`)
```
app/
├─ _layout.tsx                 # providers (Query, Theme, Auth), Stack racine
├─ index.tsx                   # redirection selon état d'auth
├─ (auth)/
│   ├─ welcome.tsx
│   ├─ login.tsx
│   ├─ register.tsx
│   └─ gym-select.tsx
├─ (onboarding)/
│   ├─ objective.tsx
│   ├─ profile.tsx
│   └─ generating.tsx
├─ (tabs)/
│   ├─ _layout.tsx             # barre d'onglets (Accueil/Séance/Groupes/Coach/Profil)
│   ├─ home.tsx
│   ├─ workout.tsx             # vue d'ensemble séance
│   ├─ groups.tsx
│   ├─ coach.tsx               # chat coach IA
│   └─ profile.tsx
├─ workout/
│   ├─ [exerciseId].tsx        # détail exercice
│   └─ active.tsx              # set actif (chrono) — plein écran, hors tabs
└─ groups/
    └─ [id]/
        ├─ index.tsx           # détail groupe + séances collectives
        └─ chat.tsx            # chat de groupe (WebSocket)
```

## Couche `src/`
```
src/
├─ api/            # client axios, endpoints, hooks React Query (useDashboard, usePrograms…)
├─ socket/         # useSocket, useCoachAI, useGroupChat
├─ store/          # auth.store.ts, theme.store.ts (Zustand)
├─ theme/          # tokens Dark/Rose (depuis la maquette), ThemeProvider, useTheme
├─ components/     # UI réutilisable + composants animés
│   ├─ ui/         # Button, Card, Input, Pill, StatTile, Avatar…
│   ├─ ProgressRing.tsx        # anneau SVG animé (Reanimated)
│   ├─ RestTimer.tsx           # chrono de repos animé + voix + haptique
│   ├─ ChatBubble.tsx / TypingDots.tsx
│   └─ ScreenTransition.tsx
└─ lib/            # utils (fmtTime, kcal, validation)
```

## Thèmes
Les **tokens** Dark/Rose de la maquette (`--accent`, `--bg`, …) deviennent un objet TS.
`ThemeProvider` (Zustand + Context) expose `useTheme()` ; bascule instantanée Sombre/Rose
(Accueil + Profil), préférence persistée (`secure-store`) et synchronisée au profil serveur.

## Animations prévues (Reanimated v4 / Moti / Lottie)
| Écran | Animation |
|---|---|
| Transitions d'écran | fondu + translation douce (`ScreenTransition`, gesture-handler) |
| Dashboard | apparition **en cascade** des cartes (stagger), anneaux qui se remplissent |
| Anneaux de progression | `strokeDashoffset` animé (Reanimated + SVG), glow |
| Set actif — repos | gros chrono animé, anneau décroissant, **haptique** à chaque palier, **voix** fin de repos |
| Boutons | micro-scale au press (`Pressable` + `useAnimatedStyle`) |
| Coach IA | bulles entrantes (slide/fade), **typing dots** animés |
| Génération IA | spinner → **Lottie** « check » au succès |
| Groupes | liste avec `Layout` animations (entrée/sortie), badge "place libérée" |
| Pull-to-refresh | indicateur personnalisé |

## Gestion d'état & données
- **React Query** : cache serveur (dashboard, programmes, groupes, séances), invalidation
  après mutations (logger série, s'inscrire…), `staleTime` adapté.
- **Zustand** : auth (tokens, user), thème, état éphémère de séance (phase, setIndex,
  restLeft) répliquant la machine d'état de la maquette.
- **Optimistic UI** : inscription séance, envoi message (rollback si erreur).
- **Offline léger** : file d'attente des `SetLog` si réseau coupé pendant une séance,
  rejouée à la reconnexion.

## Notifications push
- Au login : enregistrement du **token Expo** (`POST /devices`).
- Réception : rappel séance, message coach/groupe, place libérée, présence validée.
- Tap notification → **deep link** expo-router vers l'écran concerné.

## Build & test
- Dev : `npx expo start` → **Expo Go** (SDK 54).
- Modules natifs hors Expo Go (si besoin) → **development build** via **EAS**.
- Prod : `eas build` (iOS/Android) + `eas submit`.
