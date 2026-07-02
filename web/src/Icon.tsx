import type { CSSProperties } from 'react';

type Props = {
  /** Nom du glyphe Material Symbols Rounded, ex. "fitness_center". */
  name: string;
  size?: number;
  fill?: boolean;
  color?: string;
  weight?: number;
  style?: CSSProperties;
};

/** Icône Material Symbols Rounded, avec contrôle de la taille et du remplissage. */
export default function Icon({ name, size = 20, fill, color, weight, style }: Props) {
  const settings: string[] = [];
  if (fill !== undefined) settings.push(`'FILL' ${fill ? 1 : 0}`);
  if (weight !== undefined) settings.push(`'wght' ${weight}`);
  return (
    <span
      className="msr"
      style={{
        fontFamily: "'Material Symbols Rounded'",
        fontSize: size,
        color,
        fontVariationSettings: settings.length ? settings.join(',') : undefined,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
