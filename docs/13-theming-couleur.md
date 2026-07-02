# 13 — Theming & couleur d'accent personnalisable

Ce document décrit le modèle de thème de GymAI : un **mode de base** (Dark / Rose)
qui fixe l'ossature visuelle (fonds, surfaces, texte), **plus une couleur d'accent
100 % libre** choisie par l'utilisateur. Seule la **famille accent** est dérivée de
la couleur choisie ; tout le reste vient du mode. La règle est **partagée** entre web,
mobile et validation backend (source canonique : `assets/README.md`).

## 1. Modèle de thème

Le thème d'un utilisateur est entièrement décrit par deux valeurs :

```ts
type ThemeChoice = {
  mode: 'Dark' | 'Rose'; // mode de base (ossature : bg, surfaces, texte, lignes…)
  accent: string;        // couleur d'accent libre, hex (#rgb | #rrggbb)
};
```

- **Mode de base** — fournit l'ensemble des tokens de la maquette (`--bg`, `--surface`,
  `--txt`, `--muted`, `--line`, gradients, etc.). Voir `web/src/theme.ts`
  (`themes.Dark` / `themes.Rose`).
- **Accent libre** — remplace uniquement la **famille accent** des tokens du mode :
  `--accent`, `--accent-glow`, `--accent-dim`, `--on-accent`.

Valeurs par défaut : **mode `Dark` + accent `#5fe3f0`** (cyan de la maquette).

### Application (web)

Le thème est appliqué via **variables CSS** posées sur le `<div>` racine de l'app
(`web/src/App.tsx`, prop `style={{ ...vars }}`). Tous les écrans consomment
`var(--accent)`, `var(--accent-glow)`, etc. → changer l'accent met à jour **tout
l'écran en LIVE**, sans rechargement.

Le hook `useGymApp` (`web/src/useGymApp.ts`) :

```ts
const vars = useMemo(() => {
  const base = themes[mode];                 // ossature du mode de base
  const a = deriveAccent(theme.accent);      // famille accent dérivée
  return {
    ...base,
    '--accent': a.accent,
    '--accent-glow': a.accentGlow,
    '--accent-dim': a.accentDim,
    '--on-accent': a.onAccent,
  };
}, [mode, theme.accent]);
```

### Persistance

Le choix est persisté dans `localStorage` sous la clé `gymai.theme`
(JSON `{ mode, accent }`) et restauré au démarrage. Entrée absente ou corrompue →
repli sur les défauts (Dark + `#5fe3f0`). Sélecteur d'apparence : composant
`ColorPicker` (`web/src/screens/ColorPicker.tsx`), présent sur **Welcome**
(« Choisis ton ambiance ») et **Profil** (« Apparence »).

## 2. Algorithme de dérivation (`deriveAccent`)

Source : `web/src/theme/deriveAccent.ts`. Un seul module par stack ; même logique
côté mobile (`mobile/src/theme`) et même validation côté backend.

```ts
function deriveAccent(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const L = relativeLuminance(r, g, b);          // 0..1 (WCAG)
  return {
    accent:     hex,                             // normalisé #rrggbb
    accentGlow: `rgba(${r},${g},${b},0.45)`,     // halo lumineux
    accentDim:  `rgba(${r},${g},${b},0.14)`,     // surface tintée discrète
    // texte/icône posé SUR l'accent : sombre teinté si accent clair, sinon blanc
    onAccent:   L > 0.45 ? darkTint(r, g, b) : '#ffffff',
  };
}
```

Briques :

- **`hexToRgb(hex)`** — accepte `#rgb`, `#rrggbb`, avec ou sans `#`. Entrée invalide
  → repli sûr sur le cyan `#5fe3f0`.
- **`relativeLuminance(r,g,b)`** — luminance relative **WCAG** (linéarisation sRGB +
  pondération `0.2126·R + 0.7152·G + 0.0722·B`), dans `[0..1]`.
- **`darkTint(r,g,b)`** — convertit en HSL, conserve la teinte **H**, **plafonne la
  saturation à 55 %** et abaisse la **luminosité à 10 %** → un texte très sombre,
  lisible, qui « rappelle » l'accent sans être criard.
- Seuil `L > 0.45` : au-dessus, l'accent est jugé clair → texte sombre ;
  en dessous, accent foncé → texte blanc.

### Exemples

| Accent (`hex`) | Luminance `L` | `onAccent` | Commentaire |
|---|---|---|---|
| **Cyan** `#5fe3f0` | ≈ 0.69 (clair) | `darkTint` ≈ `#0a2a2e` | défaut maquette, texte sombre teinté cyan |
| **Rose** `#f25d8e` | ≈ 0.34 (moyen-foncé) | `#ffffff` | texte blanc sur le rose |
| **Vert** `#5ee9a0` | ≈ 0.71 (clair) | `darkTint` ≈ `#0a2a1c` | texte sombre teinté vert |
| Violet `#9d8cff` | ≈ 0.37 | `#ffffff` | texte blanc |
| Orange `#ffb86b` | ≈ 0.61 | `darkTint` ≈ `#2e1d0a` | texte sombre teinté ambre |

> Note : les valeurs de luminance et de `darkTint` ci-dessus sont indicatives
> (arrondies) ; la fonction reste la source de vérité.

Swatches préréglés exposés par l'UI : `#5fe3f0`, `#9d8cff`, `#f25d8e`, `#5ee9a0`,
`#ffb86b` (constante `ACCENT_PRESETS`).

## 3. Alignement web / mobile / backend

L'objectif est qu'un même couple `(mode, accent)` produise **exactement la même
famille accent** sur les trois stacks.

- **Web** — `web/src/theme/deriveAccent.ts`, appliqué via variables CSS racine.
- **Mobile** — `mobile/src/theme` (même algorithme, exposé en objet de style RN /
  contexte de thème). Un même `accent` → mêmes `accent / glow / dim / onAccent`.
- **Backend** — stocke le choix sur le profil et **valide le hex** à l'écriture :
  - `accent_color` — `CharField` hex (`#rrggbb`), validé (regex `^#?[0-9a-fA-F]{6}$`),
    défaut `#5fe3f0`.
  - `theme_mode` — `CharField(choices=['Dark','Rose'])`, défaut `Dark`.

  Le backend ne **dérive** pas la famille accent (ce calcul est purement présentationnel
  et appartient aux clients) : il persiste la couleur brute + le mode, et garantit la
  validité du hex. Les clients appliquent `deriveAccent` localement.

> Écart à régulariser (doc 03) : le modèle `Profile` documenté en
> `docs/03-modele-donnees.md` expose aujourd'hui `theme_pref (Dark/Rose)`. La cible
> de ce document est de remplacer ce champ par le couple **`theme_mode` (Dark/Rose)**
> **+ `accent_color` (hex)**. À synchroniser lors de l'évolution du modèle de données
> et de l'API (`05-api-rest.md`).

## 4. Accessibilité — contraste `onAccent`

Le texte/icône posé sur une surface accentuée (boutons primaires, badges) utilise
`--on-accent`. Le choix automatique vise un **contraste suffisant** quelle que soit la
couleur choisie :

- **Accent clair** (`L > 0.45`) → `onAccent` = `darkTint` (luminosité 10 %).
  Un texte très sombre sur fond clair offre un fort ratio de contraste (cible WCAG
  AA ≥ 4.5:1 pour le texte courant).
- **Accent foncé** (`L ≤ 0.45`) → `onAccent` = blanc `#ffffff`, fort contraste sur
  une couleur sombre.

Le seuil `0.45` est choisi pour basculer **avant** que le contraste avec le blanc ne
devienne insuffisant. `darkTint` borne la saturation (≤ 55 %) pour éviter qu'une
teinte sombre très saturée ne réduise la lisibilité.

Limites connues :

- L'`accent` lui-même peut être utilisé comme **couleur de texte sur le fond du mode**
  (ex. « Gym**AI** », tracés de graphes). Pour des accents très clairs en mode `Rose`
  (fond clair), ce texte-accent peut manquer de contraste : c'est un compromis assumé
  pour les éléments décoratifs/non essentiels. Les **éléments porteurs d'information**
  reposent sur `--txt` / `--muted`, indépendants de l'accent.
- `deriveAccent` optimise le contraste de `onAccent` mais ne **rejette** pas un accent
  à faible contraste sur le fond ; un garde-fou (validation/avertissement UI) pourra
  être ajouté ultérieurement.
