/**
 * deriveAccent — règle canonique partagée (web + mobile + validation backend),
 * implémentée EXACTEMENT selon `assets/README.md` :
 *
 *   accent     = hex
 *   accentGlow = rgba(r,g,b,0.45)
 *   accentDim  = rgba(r,g,b,0.14)
 *   onAccent   = luminanceWCAG > 0.45 ? darkTint(r,g,b) : '#ffffff'
 *   darkTint   = HSL de la couleur avec L = 10 %, S <= 55 %
 *
 * Valeurs par défaut (cyan maquette) : accent #5fe3f0, onAccent #06222a,
 * glow rgba(95,227,240,.45), dim rgba(95,227,240,.14).
 */

export interface AccentFamily {
  accent: string;
  accentGlow: string;
  accentDim: string;
  onAccent: string;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Normalise et parse #rgb | #rrggbb -> {r,g,b} (0..255). */
export function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    // Couleur invalide -> repli sur le cyan maquette (#5fe3f0), cohérent avec le web.
    return { r: 0x5f, g: 0xe3, b: 0xf0 };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Convertit un composant sRGB 0..255 en linéaire (formule WCAG). */
function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

/** Luminance relative WCAG (0..1). */
export function relativeLuminance(r: number, g: number, b: number): number {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

/** RGB (0..255) -> HSL (h:0..360, s:0..1, l:0..1). */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s, l };
}

/** HSL (h:0..360, s:0..1, l:0..1) -> #rrggbb. */
function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = l - c / 2;
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r1)}${to(g1)}${to(b1)}`;
}

/**
 * darkTint : reprend la teinte de la couleur, sature au plus à 55 % et
 * descend la luminosité à 10 % -> teinte très sombre, lisible sur accent clair.
 */
export function darkTint(r: number, g: number, b: number): string {
  const { h, s } = rgbToHsl(r, g, b);
  const sClamped = Math.min(s, 0.55);
  return hslToHex(h, sClamped, 0.1);
}

/** Dérive la famille accent à partir d'un hex libre. */
export function deriveAccent(hex: string): AccentFamily {
  const { r, g, b } = hexToRgb(hex);
  const L = relativeLuminance(r, g, b);
  return {
    accent: hex,
    accentGlow: `rgba(${r},${g},${b},0.45)`,
    accentDim: `rgba(${r},${g},${b},0.14)`,
    onAccent: L > 0.45 ? darkTint(r, g, b) : '#ffffff',
  };
}
