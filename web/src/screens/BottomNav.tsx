import { s } from '../lib/style';
import type { GymApp, Tab } from '../useGymApp';

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'home', icon: 'home', label: 'Accueil' },
  { key: 'workout', icon: 'fitness_center', label: 'Séance' },
  { key: 'coach', icon: 'auto_awesome', label: 'Coach IA' },
  { key: 'profile', icon: 'person', label: 'Profil' },
];

export default function BottomNav({ app }: { app: GymApp }) {
  return (
    <div
      style={s(
        'flex:0 0 auto;display:flex;border-top:1px solid var(--line2);padding:9px 10px 16px;background:var(--scrim);backdrop-filter:blur(12px);',
      )}
    >
      {TABS.map((t) => {
        const active = app.state.tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => app.go(t.key)}
            style={s('flex:1;border:none;background:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 0;')}
          >
            <span
              className="msr"
              style={s(
                "font-family:'Material Symbols Rounded';font-size:24px;color:" +
                  (active ? 'var(--accent)' : 'var(--muted2)') +
                  ";font-variation-settings:'FILL' " +
                  (active ? 1 : 0) +
                  ",'wght' 500;transition:color .2s;",
              )}
            >
              {t.icon}
            </span>
            <span
              style={s(
                'font-size:10.5px;font-weight:' +
                  (active ? 700 : 500) +
                  ';color:' +
                  (active ? 'var(--accent)' : 'var(--muted2)') +
                  ';',
              )}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
