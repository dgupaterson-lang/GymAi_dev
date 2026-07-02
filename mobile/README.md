# GymAI — App mobile (Expo SDK 54)

App fitness GymAI portée depuis la maquette web. **Expo SDK 54** (React Native 0.81 /
React 19, New Architecture, expo-router v6). Sprint 0 : moteur de thème personnalisable,
color picker, écrans Welcome + Home (dashboard) portés fidèlement du web.

## Lancer l'app

```powershell
cd mobile
npm install            # (déjà fait ; .npmrc force legacy-peer-deps)
npx expo start         # démarre Metro ; scanne le QR code avec Expo Go
```

- **Prérequis** : [Expo Go](https://expo.dev/go) **compatible SDK 54** sur ton téléphone.
- **Réseau** : le téléphone et le PC doivent être sur le **même réseau Wi-Fi**.
  Si le QR ne se connecte pas (Wi-Fi isolé, VPN), lance avec ton IP locale :
  ```powershell
  npx expo start --tunnel   # ou --lan, et vérifie l'IP affichée
  ```
- Scripts utiles : `npm run typecheck` (`tsc --noEmit`), `npm run doctor` (`expo-doctor`),
  `npm run ios` / `npm run android` / `npm run web`.

## API & authentification (JWT)

Le mobile se branche sur le backend Django (`/api/v1`). Config via **`EXPO_PUBLIC_API_URL`**.

1. Copie `.env.example` en `.env` et renseigne l'URL :
   ```powershell
   Copy-Item .env.example .env
   ```
   - **Expo Go sur téléphone physique** : mets l'**IP LAN du PC** (celle affichée par
     `npx expo start`, ou `ipconfig` → « Adresse IPv4 »), ex.
     `EXPO_PUBLIC_API_URL=http://192.168.1.20:8000/api/v1`. `localhost` NE marche PAS
     (il désigne le téléphone). Émulateur Android : `http://10.0.2.2:8000/api/v1`.
   - Les variables `EXPO_PUBLIC_*` sont inlinées au build → **redémarre `expo start`** après modif.
2. Lance le backend (`docker compose up` / `runserver`), puis `npx expo start`.
3. Flux : **Welcome** → « Créer un compte » (`register`) ou « J'ai déjà un compte » (`login`).
   Après connexion, tokens stockés dans **`expo-secure-store`** (`gymai.access` / `gymai.refresh`),
   thème hydraté depuis `user.profile`, redirection vers les onglets.
4. Comptes de démo (seed backend) : `david@email.com` / `david1234`, `coach@email.com` / `coach1234`.

**Architecture** (`src/api/`, `src/store/`) :
- `api/client.ts` — instance axios + intercepteurs (injection token, refresh 401 **une seule fois**
  avec file d'attente des requêtes concurrentes, rejeu, sinon purge + retour Welcome ; anti-boucle).
- `api/tokens.ts` — tokens via `expo-secure-store`.
- `api/auth.ts` — `register / login / refresh / logout / getMe / patchProfile`.
- `store/auth.ts` — Zustand : `user`, `isAuthenticated`, `hydrate()` (boot : SecureStore → GET /me),
  `login / register / logout`. Hydrate le thème depuis le profil serveur à la connexion.
- `store/themeSync.ts` — quand connecté, tout changement mode/accent → **PATCH `/me/profile` débouncé
  (~500 ms)**. AsyncStorage reste le cache offline.

### Repli gracieux (API injoignable)
L'app **ne bloque jamais** si le backend est absent :
- Au boot, si `GET /me` échoue (réseau / token expiré), on log un warning et on reste en
  **mode démo local** (non authentifié) : Welcome + navigation restent accessibles.
- Un `PATCH /me/profile` qui échoue est loggé sans casser l'UI (le cache local AsyncStorage
  garde le choix de thème) ; un nouvel essai est autorisé au changement suivant.
- `logout` purge les tokens locaux même si l'appel réseau échoue.

> Pas d'émulateur requis pour le dev : Expo Go suffit. Un *development build* (EAS) ne
> sera nécessaire que pour des modules natifs hors Expo Go (plus tard).

## Arborescence

```
mobile/
├─ app/                          # routes expo-router (file-based)
│  ├─ _layout.tsx                # providers (Theme, GestureHandler, SafeArea), polices, splash
│  ├─ index.tsx                  # redirection -> (auth)/welcome
│  ├─ color-picker.tsx           # feuille modale du color picker (Welcome + Profil)
│  ├─ (auth)/
│  │  ├─ _layout.tsx
│  │  └─ welcome.tsx             # écran Welcome porté du web
│  └─ (tabs)/
│     ├─ _layout.tsx             # barre d'onglets Accueil/Séance/Coach/Profil
│     ├─ home.tsx                # dashboard porté du web (stagger + anneaux animés)
│     ├─ workout.tsx             # placeholder
│     ├─ coach.tsx               # placeholder
│     └─ profile.tsx             # placeholder + ambiance + accès color picker
├─ src/
│  ├─ theme/                     # MOTEUR DE THÈME
│  │  ├─ tokens.ts               # palettes Dark/Rose (reprises de web/src/theme.ts)
│  │  ├─ deriveAccent.ts         # règle canonique accent (assets/README.md)
│  │  ├─ store.ts                # Zustand { mode, accent } + persistance AsyncStorage
│  │  ├─ ThemeProvider.tsx       # Context + useTheme() (accent remplacé par deriveAccent)
│  │  ├─ fonts.ts                # noms des familles de polices
│  │  └─ index.ts                # exports + PRESET_SWATCHES
│  ├─ components/
│  │  ├─ ColorPicker.tsx         # picker HSL maison + swatches + bascule mode + aperçu live
│  │  ├─ ProgressRings.tsx       # double anneau SVG animé (Reanimated)
│  │  ├─ ThemePills.tsx          # bascule Sombre/Rose + bouton Couleur
│  │  ├─ ScreenPlaceholder.tsx
│  │  └─ ui/                     # Icon, PressableScale, StaggerItem, HueSlider, Stripes
│  └─ lib/color.ts               # helpers HSL <-> hex (sliders)
├─ assets/images/                # icône / splash (PNG)
├─ app.json                      # nom « GymAI », scheme « gymai », fond #080a10, New Arch
├─ babel.config.js               # plugin react-native-worklets (dernier)
└─ metro.config.js
```

## Moteur de thème (personnalisable)

L'utilisateur choisit **un mode de base** (Sombre / Rose, qui fixe fond/surfaces/texte)
**+ une couleur d'accent libre**. Seule la famille accent est dérivée de la couleur choisie
(`accent`, `accentGlow`, `accentDim`, `onAccent`) via `deriveAccent()` — règle canonique
identique au web et à `assets/README.md` (luminance WCAG > 0,45 → texte sombre teinté,
sinon blanc ; `darkTint` = HSL L=10 %, S≤55 %).

- État `{ mode, accent }` dans un store Zustand, **persisté** (AsyncStorage), exposé par
  `useTheme()`. Bascule instantanée, aperçu live.
- Color picker accessible depuis **Welcome** (« Choisis ton ambiance ») et **Profil** :
  picker HSL maison (sliders Reanimated + gesture-handler) + swatches préréglés
  (cyan, violet, rose, vert, orange) + bascule Sombre/Rose.

## Animations

- **Dashboard** : apparition **en cascade** des cartes (`StaggerItem`, fade + translation).
- **Boutons** : micro-scale au press (`PressableScale`, `useAnimatedStyle`).
- **Anneaux** : `strokeDashoffset` animé (Reanimated + SVG).
- Reanimated v4 + gesture-handler configurés (plugin `react-native-worklets/plugin`, New Arch).

## Polices & icônes

- **Space Grotesk** (titres/chiffres) + **Hanken Grotesk** (corps) via `@expo-google-fonts`.
- Icônes : `@expo/vector-icons` **MaterialIcons** (équivalent des Material Symbols web),
  mappées dans `src/components/ui/Icon.tsx`.

## État d'avancement (Sprint 0)

| Élément | État |
|---|---|
| Init Expo SDK 54 + expo-router v6 + New Arch | OK |
| Moteur de thème (Dark/Rose + accent libre, persisté) | OK |
| `deriveAccent` conforme à la règle canonique | OK |
| Color picker (HSL maison + swatches + mode + aperçu live) | OK |
| Welcome porté (textes FR, couleurs thème) | OK |
| Home / dashboard porté (stagger + anneaux) | OK |
| Onglets Séance / Coach / Profil | Placeholders |
| **Auth JWT réelle (login/register/logout) + garde d'auth** | **OK** |
| **Persistance thème côté serveur (PATCH /me/profile débouncé)** | **OK** |
| `tsc --noEmit` / `expo-doctor` | Passent |
| Onboarding, séance active, coach IA, groupes, WebSocket | À venir |

### Limitations connues
- `reanimated-color-picker` exige `expo@56` en peer dependency ; le projet étant en **SDK 54**,
  on a implémenté un **picker HSL maison** (Reanimated + gesture-handler) à la place.
- `.npmrc` force `legacy-peer-deps=true` (résout des conflits de peer deps react-dom/expo).
- `index.tsx` redirige selon l'état de session (`isAuthenticated`) : tabs si connecté, sinon Welcome.
- Auth branchée sur l'API réelle ; sans backend joignable, l'app reste utilisable en mode démo
  local (voir « Repli gracieux »).
- Validé par typecheck + `expo-doctor` (18/18) ; non testé sur device réel ni contre un backend live.
