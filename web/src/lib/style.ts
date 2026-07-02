import type { CSSProperties } from 'react';

/**
 * Convertit une chaîne CSS inline ("prop:val;prop:val") en objet de style React.
 * Permet de reprendre fidèlement les styles de la maquette GymAI sans erreur de
 * transcription, y compris les propriétés personnalisées (--accent, etc.).
 */
export function s(css: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i === -1) continue;
    const rawProp = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!rawProp || !val) continue;
    const prop = rawProp.startsWith('--')
      ? rawProp
      : rawProp.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[prop] = val;
  }
  return out as CSSProperties;
}

/** Raccourci pour une icône Material Symbols Rounded à la taille/au remplissage voulus. */
export function icon(
  name: string,
  extra = '',
): { className: string; style: CSSProperties; children: string } {
  return { className: 'msr', style: s(extra), children: name };
}
