import { s } from '../lib/style';
import ColorPicker from './ColorPicker';
import type { GymApp } from '../useGymApp';

const MEASURES = [
  { label: 'Tour de taille', value: '82', unit: 'cm' },
  { label: 'Bras', value: '38', unit: 'cm' },
  { label: 'Pectoraux', value: '104', unit: 'cm' },
  { label: 'Cuisses', value: '58', unit: 'cm' },
];

export default function Profile({ app }: { app: GymApp }) {
  return (
    <div data-scroll style={s('width:100%;height:100%;overflow-y:auto;padding:14px 20px 26px;')}>
      <div style={s('display:flex;align-items:center;gap:14px;margin-bottom:20px;')}>
        <div
          style={s(
            "width:62px;height:62px;border-radius:50%;background:var(--surface2);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk';font-weight:700;font-size:24px;color:var(--accent);box-shadow:0 0 18px var(--accent-dim);",
          )}
        >
          {app.initial}
        </div>
        <div>
          <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:20px;")}>{app.name} Mensah</div>
          <div style={s('font-size:12.5px;color:var(--muted);margin-top:2px;')}>
            Membre Premium · {app.gymName}
          </div>
        </div>
      </div>

      {/* évolution du poids */}
      <div style={s('border-radius:22px;padding:18px;background:var(--surface);border:1px solid var(--line);margin-bottom:16px;')}>
        <div style={s('display:flex;align-items:center;justify-content:space-between;')}>
          <div style={s("font-size:14px;font-weight:700;font-family:'Space Grotesk';")}>Évolution du poids</div>
          <div style={s('font-size:12px;font-weight:700;color:var(--good);')}>−2,1 kg · 30 j</div>
        </div>
        <svg viewBox="0 0 280 90" width="100%" height="90" style={{ marginTop: 12, overflow: 'visible' }}>
          <polyline
            points="0,20 47,28 93,24 140,42 187,52 233,60 280,70"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 5px var(--accent-glow))' }}
          />
          <circle cx="280" cy="70" r="5" fill="var(--accent)" style={{ filter: 'drop-shadow(0 0 6px var(--accent-glow))' }} />
        </svg>
        <div style={s('display:flex;justify-content:space-between;font-size:11px;color:var(--muted2);margin-top:4px;')}>
          <span>1 juin</span>
          <span>30 juin · 78,4 kg</span>
        </div>
      </div>

      <div style={s('font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);font-weight:700;margin:4px 0 10px;')}>
        Apparence
      </div>
      <div style={s('margin-bottom:18px;')}>
        <ColorPicker app={app} />
      </div>

      <div style={s('font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);font-weight:700;margin:4px 0 10px;')}>
        Mensurations
      </div>
      <div style={s('display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;')}>
        {MEASURES.map((ms) => (
          <div key={ms.label} style={s('border-radius:16px;padding:14px;background:var(--surface);border:1px solid var(--line);')}>
            <div style={s('font-size:12px;color:var(--muted);font-weight:600;')}>{ms.label}</div>
            <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:21px;margin-top:5px;")}>
              {ms.value} <span style={s('font-size:12px;color:var(--muted2);')}>{ms.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={s('font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);font-weight:700;margin:4px 0 10px;')}>
        Photos avant / après
      </div>
      <div style={s('display:grid;grid-template-columns:1fr 1fr;gap:12px;')}>
        <div
          style={s(
            'aspect-ratio:3/4;border-radius:16px;background:repeating-linear-gradient(135deg,var(--ph2),var(--ph2) 8px,var(--ph3) 8px,var(--ph3) 16px);border:1px solid var(--line);display:flex;align-items:flex-end;padding:12px;',
          )}
        >
          <span style={s("font-family:'Space Grotesk';font-size:10px;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase;")}>
            avant · mars
          </span>
        </div>
        <div
          style={s(
            'aspect-ratio:3/4;border-radius:16px;background:repeating-linear-gradient(135deg,var(--ph2),var(--ph2) 8px,var(--ph3) 8px,var(--ph3) 16px);border:1px solid var(--line);display:flex;align-items:flex-end;padding:12px;',
          )}
        >
          <span style={s("font-family:'Space Grotesk';font-size:10px;letter-spacing:.1em;color:var(--muted2);text-transform:uppercase;")}>
            après · juin
          </span>
        </div>
      </div>

      <button
        onClick={app.logout}
        className="dc-hover-border-txt"
        style={s(
          'margin-top:22px;width:100%;border:1px solid var(--line);background:transparent;color:var(--muted);font-weight:700;font-size:14px;padding:14px;border-radius:14px;cursor:pointer;',
        )}
      >
        Se déconnecter
      </button>
    </div>
  );
}
