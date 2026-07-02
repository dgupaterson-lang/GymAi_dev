import { s } from '../lib/style';
import Icon from '../Icon';
import type { ThemeName } from '../theme';
import { ACCENT_PRESETS } from '../theme/deriveAccent';
import type { GymApp } from '../useGymApp';

const MODES: { key: ThemeName; label: string; icon: string }[] = [
  { key: 'Dark', label: 'Sombre', icon: 'dark_mode' },
  { key: 'Rose', label: 'Rose', icon: 'favorite' },
];

/**
 * Sélecteur d'apparence complet :
 *  - toggle du MODE de base (Sombre / Rose),
 *  - une rangée de swatches d'accent préréglés,
 *  - un <input type="color"> pour une couleur libre.
 * L'aperçu se met à jour en LIVE sur tout l'écran (variables CSS racine).
 */
export default function ColorPicker({ app }: { app: GymApp }) {
  const accent = app.accent;
  const norm = accent.toLowerCase();

  return (
    <div style={s('display:flex;flex-direction:column;gap:14px;')}>
      {/* Mode de base */}
      <div style={s('display:flex;gap:10px;')}>
        {MODES.map(({ key, label, icon }) => {
          const active = app.effTheme === key;
          return (
            <div
              key={key}
              onClick={() => app.setMode(key)}
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

      {/* Accent : swatches préréglés + sélection libre */}
      <div style={s('display:flex;align-items:center;gap:10px;')}>
        {ACCENT_PRESETS.map((c) => {
          const active = norm === c.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              aria-label={'Accent ' + c}
              onClick={() => app.setAccent(c)}
              style={{
                ...s(
                  'width:34px;height:34px;border-radius:50%;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;transition:transform .15s,box-shadow .15s;',
                ),
                background: c,
                border: active ? '2.5px solid var(--txt)' : '2px solid var(--line)',
                boxShadow: active ? `0 0 12px ${c}` : 'none',
                transform: active ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {active && <Icon name="check" size={16} color="#fff" weight={700} />}
            </button>
          );
        })}

        {/* Sélection libre — l'input color natif */}
        <label
          style={{
            ...s(
              'width:34px;height:34px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;',
            ),
            border: '2px dashed var(--muted2)',
          }}
          title="Couleur personnalisée"
        >
          <Icon name="palette" size={18} color="var(--muted)" />
          <input
            type="color"
            value={accent}
            onChange={(e) => app.setAccent(e.target.value)}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'pointer',
              width: '100%',
              height: '100%',
              border: 'none',
              padding: 0,
            }}
          />
        </label>
      </div>
    </div>
  );
}
