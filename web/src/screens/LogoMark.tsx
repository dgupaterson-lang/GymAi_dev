import { deriveAccent } from '../theme/deriveAccent';

/**
 * Badge GymAI (assets/brand/logo-mark.svg) recoloré en LIVE à la couleur
 * d'accent courante. Le badge prend l'accent ; l'haltère utilise `onAccent`
 * pour rester lisible quelle que soit la teinte choisie.
 */
export default function LogoMark({ accent, size = 40 }: { accent: string; size?: number }) {
  const { accent: fill, onAccent } = deriveAccent(accent);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label="GymAI"
      style={{ filter: 'drop-shadow(0 0 18px var(--accent-glow))', borderRadius: size * 0.29 }}
    >
      <rect width="48" height="48" rx="14" fill={fill} />
      <g fill={onAccent}>
        <rect x="6" y="20" width="4" height="8" rx="2" />
        <rect x="11" y="17" width="4.5" height="14" rx="2.2" />
        <rect x="15" y="22" width="18" height="4" rx="2" />
        <rect x="32.5" y="17" width="4.5" height="14" rx="2.2" />
        <rect x="38" y="20" width="4" height="8" rx="2" />
      </g>
    </svg>
  );
}
