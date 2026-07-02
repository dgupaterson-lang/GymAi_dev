import { s } from '../lib/style';
import Icon from '../Icon';
import type { ThemeName } from '../theme';
import type { GymApp } from '../useGymApp';

const OPTS: { key: ThemeName; label: string; icon: string }[] = [
  { key: 'Dark', label: 'Sombre', icon: 'dark_mode' },
  { key: 'Rose', label: 'Rose', icon: 'favorite' },
];

/** Sélecteur d'ambiance (Sombre / Rose), partagé entre Accueil et Profil. */
export default function ThemePills({ app }: { app: GymApp }) {
  return (
    <div style={s('display:flex;gap:10px;')}>
      {OPTS.map(({ key, label, icon }) => {
        const active = app.effTheme === key;
        return (
          <div
            key={key}
            onClick={() => app.setTheme(key)}
            style={s(
              "flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:13px;border-radius:14px;cursor:pointer;font-weight:700;font-size:13.5px;font-family:'Space Grotesk';border:1.5px solid " +
                (active ? 'var(--accent)' : 'var(--line)') +
                ';background:' +
                (active ? 'var(--accent-dim)' : 'var(--surface)') +
                ';color:' +
                (active ? 'var(--accent)' : 'var(--muted)') +
                ';transition:all .2s;',
            )}
          >
            <Icon name={icon} size={18} fill />
            {label}
          </div>
        );
      })}
    </div>
  );
}
