# Assets GymAI

Assets **vectoriels (SVG) authorés à la main** aux couleurs de la maquette. Ce ne sont
**pas des photos** : les vrais visuels (athlète, salles, démos vidéo) et les **Lottie**
viendront les remplacer. Tout est conçu pour être **remplaçable** et **adaptable à la
couleur d'accent choisie par l'utilisateur**.

## Inventaire

| Fichier | Usage | Adaptable couleur |
|---|---|---|
| `brand/logo-mark.svg` | Badge/icône GymAI (48) | oui (recolorer le `rect` accent) |
| `brand/logo-wordmark.svg` | Logo horizontal « GymAI » | oui (accent) |
| `brand/app-icon.svg` | Icône d'app (1024) | figée (store) |
| `brand/splash.svg` | Écran de démarrage (1080×1920) | figée |
| `illustrations/hero-athlete.svg` | Écran Welcome | barre = accent |
| `illustrations/success-check.svg` | Fin de séance / programme prêt | accent |
| `illustrations/ai-generating.svg` | Génération IA (anneau, à animer) | accent |
| `placeholders/gym-tile.svg` | Vignette salle (motif rayé) | neutre |
| `placeholders/exercise-thumb.svg` | Vignette démo exercice | bouton play accent |
| `placeholders/avatar-coach.svg` | Avatar coach par défaut | anneau accent |

## Couleur d'accent personnalisable — règle canonique

L'utilisateur choisit **un mode de base** (`Dark` ou `Rose`, qui fixe fond/surfaces/texte)
**+ une couleur d'accent libre**. Seule la **famille accent** est dérivée de la couleur
choisie ; le reste vient du mode. Algorithme partagé (web + mobile + validation backend) :

```ts
// hex (#rgb | #rrggbb) -> variables de la famille accent
function deriveAccent(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const L = relativeLuminance(r, g, b);          // 0..1 (WCAG)
  return {
    accent:     hex,
    accentGlow: `rgba(${r},${g},${b},0.45)`,
    accentDim:  `rgba(${r},${g},${b},0.14)`,
    // texte posé SUR l'accent : sombre teinté si accent clair, sinon blanc
    onAccent:   L > 0.45 ? darkTint(r, g, b) : '#ffffff',
  };
}
// darkTint : HSL de la couleur avec L=10%, S<=55% -> teinte très sombre lisible
```

Valeurs par défaut (cyan maquette) : `accent #5fe3f0`, `onAccent #06222a`,
`glow rgba(95,227,240,.45)`, `dim rgba(95,227,240,.14)`.

> Implémentation : un seul module par stack (`web/src/theme`, `mobile/src/theme`) ;
> le backend valide le hex et stocke `accent_color` + `theme_mode` sur le profil.

## Conversion SVG → PNG (si nécessaire)
Icône/splash de store demandent souvent du PNG. À exporter ensuite via un outil au choix
(ex. `sharp`, Inkscape, ou `npx svgexport`) — non requis pour le dev en Expo Go.
