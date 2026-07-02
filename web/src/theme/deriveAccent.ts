/**
 * Dérivation de la « famille accent » à partir d'une couleur d'accent libre.
 *
 * Règle canonique partagée entre web / mobile / validation backend
 * (cf. assets/README.md). L'utilisateur choisit un MODE de base (Dark|Rose),
 * qui fixe fonds/surfaces/texte, PLUS une couleur d'accent libre. Seule la
 * famille accent (`--accent`, `--accent-glow`, `--accent-dim`, `--on-accent`)
 * est dérivée de la couleur choisie ; tout le reste vient du mode.
 */

/** Triplet RGB en composantes 0..255. */
export type Rgb = { r: number; g: number; b: number };

/** Variables CSS de la famille accent produites par {@link deriveAccent}. */
export type AccentVars = {
  /** Couleur d'accent brute (telle que choisie). */
  accent: string;
  /** Halo lumineux (accent à 45 % d'opacité). */
  accentGlow: string;
  /** Surface tintée discrète (accent à 14 % d'opacité). */
  accentDim: string;
  /** Texte/icône posé SUR l'accent (sombre teinté si accent clair, sinon blanc). */
  onAccent: string;
};

/**
 * Convertit un hex (`#rgb` ou `#rrggbb`, avec ou sans `#`) en triplet RGB 0..255.
 * Toute entrée invalide retombe sur le cyan par défaut (#5fe3f0) pour rester sûr.
 */
export function hexToRgb(hex: string): Rgb {
  let h = (hex || '').trim().replace(/^#/, '');
  // Forme courte #rgb -> #rrggbb
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) {
    // Repli sur le cyan maquette en cas d'entrée invalide.
    return { r: 0x5f, g: 0xe3, b: 0xf0 };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Linéarise une composante sRGB 0..255 vers l'espace linéaire 0..1 (WCAG). */
function linearize(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Luminance relative WCAG d'une couleur RGB, dans [0..1].
 * 0 = noir, 1 = blanc. Sert à décider si le texte posé sur l'accent
 * doit être sombre (accent clair) ou blanc (accent foncé).
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Convertit RGB 0..255 en HSL (h:0..360, s:0..1, l:0..1). */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let sat = 0;
  const d = max - min;
  if (d !== 0) {
    sat = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: sat, l };
}

/** Convertit HSL (h:0..360, s:0..1, l:0..1) en hex `#rrggbb`. */
function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to2 = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return '#' + to2(r) + to2(g) + to2(b);
}

/**
 * Teinte très sombre et lisible dérivée de la couleur :
 * on conserve la teinte (H), on plafonne la saturation à 55 % et on
 * abaisse la luminosité à 10 %. Donne un texte sombre qui « rappelle »
 * l'accent sans être criard, posé sur un accent clair.
 */
export function darkTint(r: number, g: number, b: number): string {
  const { h, s } = rgbToHsl(r, g, b);
  return hslToHex(h, Math.min(s, 0.55), 0.1);
}

/**
 * Dérive la famille accent à partir d'une couleur hex libre.
 *
 * @example deriveAccent('#5fe3f0') // cyan clair -> onAccent sombre teinté
 * @example deriveAccent('#f25d8e') // rose moyen -> onAccent #ffffff
 * @example deriveAccent('#5ee9a0') // vert clair -> onAccent sombre teinté
 */
export function deriveAccent(hex: string): AccentVars {
  const { r, g, b } = hexToRgb(hex);
  const L = relativeLuminance(r, g, b); // 0..1 (WCAG)
  // Normalise vers une forme #rrggbb canonique (gère #rgb / sans #).
  const accent =
    '#' +
    [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
  return {
    accent,
    accentGlow: `rgba(${r},${g},${b},0.45)`,
    accentDim: `rgba(${r},${g},${b},0.14)`,
    // Texte posé SUR l'accent : sombre teinté si accent clair, sinon blanc.
    onAccent: L > 0.45 ? darkTint(r, g, b) : '#ffffff',
  };
}

/** Swatches préréglés proposés dans le ColorPicker. */
export const ACCENT_PRESETS = ['#5fe3f0', '#9d8cff', '#f25d8e', '#5ee9a0', '#ffb86b'] as const;
