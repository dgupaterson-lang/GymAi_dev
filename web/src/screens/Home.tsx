import { s } from '../lib/style';
import Icon from '../Icon';
import type { GymApp } from '../useGymApp';

const STATS = [
  { ic: 'monitor_weight', tag: '−1,2 kg', tagColor: 'var(--good)', value: '78,4', unit: 'kg', label: 'Poids actuel' },
  { ic: 'straighten', tag: 'normal', tagColor: 'var(--muted2)', value: '23,1', unit: '', label: 'Indice IMC' },
  { ic: 'exercise', tag: '+0,8 %', tagColor: 'var(--good)', value: '42', unit: '%', label: 'Masse musculaire' },
  { ic: 'water_drop', tag: '72 %', tagColor: 'var(--muted2)', value: '1,8', unit: '/ 2,5 L', label: 'Hydratation' },
];

export default function Home({ app }: { app: GymApp }) {
  const calDash = (276.5 * (1 - 0.78)).toFixed(1);
  const seaDash = (201.06 * (1 - 0.8)).toFixed(1);

  return (
    <div data-scroll style={s('width:100%;height:100%;overflow-y:auto;padding:6px 20px 26px;')}>
      <div style={s('display:flex;justify-content:space-between;align-items:flex-start;margin:10px 0 18px;')}>
        <div>
          <div
            style={s(
              "font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted2);font-weight:600;font-family:'Space Grotesk';",
            )}
          >
            Mardi 30 juin
          </div>
          <div
            style={s(
              "font-size:25px;font-weight:700;letter-spacing:-.02em;margin-top:4px;font-family:'Space Grotesk';",
            )}
          >
            Bonjour, {app.name}
          </div>
        </div>
        <div
          style={s(
            "width:46px;height:46px;border-radius:50%;background:var(--surface2);border:1.5px solid var(--accent);display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk';font-weight:700;color:var(--accent);box-shadow:0 0 14px var(--accent-dim);",
          )}
        >
          {app.initial}
        </div>
      </div>

      {/* programme du jour */}
      <div
        style={s(
          'position:relative;border-radius:24px;padding:20px;overflow:hidden;background:var(--hero-grad);border:1px solid var(--line);margin-bottom:16px;',
        )}
      >
        <div
          style={s(
            'position:absolute;right:-34px;top:-34px;width:170px;height:170px;border-radius:50%;background:var(--accent);opacity:.15;filter:blur(34px);',
          )}
        />
        <div style={s('position:relative;')}>
          <div
            style={s(
              'display:flex;align-items:center;gap:7px;color:var(--accent);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;',
            )}
          >
            <Icon name="bolt" size={16} fill />
            Programme du jour
          </div>
          <div
            style={s("font-size:22px;font-weight:700;margin-top:8px;font-family:'Space Grotesk';letter-spacing:-.02em;")}
          >
            Pectoraux &amp; Triceps
          </div>
          <div
            style={s(
              'display:flex;gap:14px;margin-top:9px;color:var(--muted);font-size:12.5px;font-weight:500;flex-wrap:wrap;',
            )}
          >
            <span style={s('display:flex;align-items:center;gap:5px;')}>
              <Icon name="exercise" size={15} />6 exercices
            </span>
            <span style={s('display:flex;align-items:center;gap:5px;')}>
              <Icon name="schedule" size={15} />45 min
            </span>
            <span style={s('display:flex;align-items:center;gap:5px;')}>
              <Icon name="local_fire_department" size={15} />~420 kcal
            </span>
          </div>
          <button
            onClick={app.startWorkout}
            className="dc-hover-bright"
            style={s(
              "margin-top:16px;width:100%;border:none;cursor:pointer;background:var(--accent);color:var(--on-accent);font-family:'Space Grotesk';font-weight:700;font-size:15px;padding:14px;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 24px var(--accent-dim);",
            )}
          >
            <Icon name="play_arrow" size={20} fill />
            Commencer la séance
          </button>
          <div style={s('margin-top:10px;text-align:center;color:var(--muted2);font-size:12px;')}>
            Prochaine séance collective dans 2 h 15
          </div>
        </div>
      </div>

      {/* cette semaine */}
      <div
        style={s('border-radius:24px;padding:18px;background:var(--surface);border:1px solid var(--line);margin-bottom:16px;')}
      >
        <div style={s('display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;')}>
          <div style={s("font-size:15px;font-weight:700;font-family:'Space Grotesk';")}>Cette semaine</div>
          <div style={s('font-size:12px;color:var(--muted2);font-weight:600;')}>26 — 30 juin</div>
        </div>
        <div style={s('display:flex;align-items:center;gap:18px;')}>
          <svg width="116" height="116" viewBox="0 0 116 116" style={{ flex: '0 0 auto' }}>
            <circle cx="58" cy="58" r="44" fill="none" stroke="var(--line)" strokeWidth="9" />
            <circle cx="58" cy="58" r="32" fill="none" stroke="var(--line)" strokeWidth="9" />
            <circle
              cx="58"
              cy="58"
              r="44"
              fill="none"
              stroke="var(--violet)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray="276.5"
              strokeDashoffset={calDash}
              transform="rotate(-90 58 58)"
              style={{ filter: 'drop-shadow(0 0 5px var(--violet))' }}
            />
            <circle
              cx="58"
              cy="58"
              r="32"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray="201.06"
              strokeDashoffset={seaDash}
              transform="rotate(-90 58 58)"
              style={{ filter: 'drop-shadow(0 0 5px var(--accent))' }}
            />
          </svg>
          <div style={s('flex:1;display:flex;flex-direction:column;gap:14px;')}>
            <div>
              <div style={s('display:flex;align-items:center;gap:6px;color:var(--muted);font-size:12px;font-weight:600;')}>
                <span style={s('width:9px;height:9px;border-radius:50%;background:var(--violet);display:inline-block;')} />
                Calories brûlées
              </div>
              <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:21px;margin-top:2px;")}>
                4 820 <span style={s('font-size:12px;color:var(--muted2);font-weight:500;')}>/ 6 200 kcal</span>
              </div>
            </div>
            <div>
              <div style={s('display:flex;align-items:center;gap:6px;color:var(--muted);font-size:12px;font-weight:600;')}>
                <span style={s('width:9px;height:9px;border-radius:50%;background:var(--accent);display:inline-block;')} />
                Séances
              </div>
              <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:21px;margin-top:2px;")}>
                4 <span style={s('font-size:12px;color:var(--muted2);font-weight:500;')}>/ 5 objectif</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* grille de stats */}
      <div style={s('display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;')}>
        {STATS.map((st) => (
          <div key={st.label} style={s('border-radius:20px;padding:15px;background:var(--surface);border:1px solid var(--line);')}>
            <div style={s('display:flex;align-items:center;justify-content:space-between;')}>
              <Icon name={st.ic} size={20} color="var(--accent)" fill />
              <span style={{ ...s('font-size:11px;font-weight:700;'), color: st.tagColor }}>{st.tag}</span>
            </div>
            <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:23px;margin-top:10px;")}>
              {st.value} {st.unit && <span style={s('font-size:13px;color:var(--muted2);')}>{st.unit}</span>}
            </div>
            <div style={s('font-size:12px;color:var(--muted);font-weight:500;margin-top:2px;')}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* carte coach IA */}
      <div
        onClick={app.goCoach}
        className="dc-hover-border"
        style={s(
          'cursor:pointer;border-radius:24px;padding:18px;background:linear-gradient(135deg, var(--violet-dim), var(--accent-dim));border:1px solid var(--line);display:flex;align-items:center;gap:14px;',
        )}
      >
        <div
          style={s(
            'width:46px;height:46px;border-radius:14px;background:var(--surface2);display:flex;align-items:center;justify-content:center;color:var(--accent);box-shadow:0 0 16px var(--accent-dim);flex:0 0 auto;',
          )}
        >
          <Icon name="auto_awesome" size={26} fill />
        </div>
        <div style={s('flex:1;')}>
          <div style={s("font-weight:700;font-family:'Space Grotesk';font-size:15px;")}>Coach IA</div>
          <div style={s('font-size:12.5px;color:var(--muted);margin-top:2px;line-height:1.4;')}>
            « Au rythme actuel, objectif atteint dans 67 jours. »
          </div>
        </div>
        <Icon name="chevron_right" color="var(--muted2)" />
      </div>
    </div>
  );
}
