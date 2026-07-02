import { s } from '../lib/style';
import Icon from '../Icon';
import type { GymApp } from '../useGymApp';

export default function ActiveSet({ app }: { app: GymApp }) {
  const st = app.state;
  const ex = app.ex;
  const restDash = (628.3 * (1 - st.restLeft / st.restTotal)).toFixed(1);

  return (
    <div
      style={s(
        'width:100%;height:100%;display:flex;flex-direction:column;padding:16px 22px 24px;background:radial-gradient(600px 500px at 50% 30%, var(--active-bg) 0%, var(--bg) 70%);',
      )}
    >
      <div style={s('display:flex;align-items:center;justify-content:space-between;')}>
        <button
          onClick={app.exitWorkout}
          style={s(
            'border:none;background:var(--surface2);color:var(--txt);width:38px;height:38px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;',
          )}
        >
          <Icon name="close" />
        </button>
        <div
          style={s(
            'font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);font-weight:700;text-align:center;',
          )}
        >
          {ex.name}
        </div>
        <div style={{ width: 38 }} />
      </div>

      {/* points de progression des séries */}
      <div style={s('display:flex;gap:7px;justify-content:center;margin-top:16px;')}>
        {Array.from({ length: ex.sets }, (_, i) => {
          const done = i < st.setIndex || st.phase === 'done';
          const current = i === st.setIndex && st.phase !== 'done';
          return (
            <span
              key={i}
              style={s(
                'width:8px;height:8px;border-radius:50%;display:inline-block;transition:all .3s;background:' +
                  (done ? 'var(--accent)' : 'var(--line)') +
                  ';' +
                  (current ? 'box-shadow:0 0 9px var(--accent-glow);transform:scale(1.3);' : ''),
              )}
            />
          );
        })}
      </div>

      {/* phase : effort */}
      {st.phase === 'work' && (
        <>
          <div style={s('flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;')}>
            <div style={s('font-size:13px;color:var(--accent);font-weight:700;letter-spacing:.06em;text-transform:uppercase;')}>
              Série {st.setIndex + 1} / {ex.sets}
            </div>
            <div style={s("font-family:'Space Grotesk';font-size:104px;font-weight:700;line-height:1;letter-spacing:-.04em;margin:14px 0 6px;")}>
              {ex.reps}
            </div>
            <div style={s('font-size:15px;color:var(--muted);font-weight:600;')}>répétitions · {ex.charge}</div>
          </div>
          <button
            onClick={app.validateSet}
            className="dc-hover-bright"
            style={s(
              "width:100%;border:none;cursor:pointer;background:var(--accent);color:var(--on-accent);font-family:'Space Grotesk';font-weight:700;font-size:16px;padding:17px;border-radius:16px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 28px var(--accent-dim);",
            )}
          >
            <Icon name="check_circle" size={21} fill />
            Valider la série
          </button>
        </>
      )}

      {/* phase : repos */}
      {st.phase === 'rest' && (
        <div style={s('flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;')}>
          <div style={s('position:relative;width:230px;height:230px;display:flex;align-items:center;justify-content:center;')}>
            <svg width="230" height="230" viewBox="0 0 230 230" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="115" cy="115" r="100" fill="none" stroke="var(--line)" strokeWidth="12" />
              <circle
                cx="115"
                cy="115"
                r="100"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="628.3"
                strokeDashoffset={restDash}
                transform="rotate(-90 115 115)"
                style={{
                  filter: 'drop-shadow(0 0 9px var(--accent-glow))',
                  transition: 'stroke-dashoffset .95s linear',
                }}
              />
            </svg>
            <div style={s('text-align:center;')}>
              <div style={s('font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:700;')}>
                Repos
              </div>
              <div style={s("font-family:'Space Grotesk';font-size:60px;font-weight:700;line-height:1;margin-top:4px;")}>
                {app.fmtTime(st.restLeft)}
              </div>
            </div>
          </div>
          {app.voiceOn && (
            <div
              style={s(
                'display:flex;align-items:center;gap:6px;margin-top:18px;color:var(--accent);font-size:12px;font-weight:600;background:var(--accent-dim);padding:6px 12px;border-radius:20px;',
              )}
            >
              <Icon name="graphic_eq" size={16} />
              Annonce vocale activée
            </div>
          )}
          <div style={s('display:flex;gap:10px;margin-top:20px;width:100%;')}>
            <button
              onClick={app.minus15}
              className="dc-hover-border"
              style={s(
                "flex:1;border:1px solid var(--line);background:var(--surface);color:var(--txt);font-family:'Space Grotesk';font-weight:700;font-size:14px;padding:13px;border-radius:13px;cursor:pointer;",
              )}
            >
              −15 s
            </button>
            <button
              onClick={app.plus15}
              className="dc-hover-border"
              style={s(
                "flex:1;border:1px solid var(--line);background:var(--surface);color:var(--txt);font-family:'Space Grotesk';font-weight:700;font-size:14px;padding:13px;border-radius:13px;cursor:pointer;",
              )}
            >
              +15 s
            </button>
          </div>
          <button
            onClick={app.skipRest}
            style={s('margin-top:12px;width:100%;border:none;background:none;color:var(--accent);font-weight:700;font-size:14px;cursor:pointer;padding:6px;')}
          >
            Passer le repos →
          </button>
        </div>
      )}

      {/* phase : exercice terminé */}
      {st.phase === 'done' && (
        <>
          <div style={s('flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;')}>
            <div
              style={s(
                'width:90px;height:90px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);box-shadow:0 0 34px var(--accent-glow);',
              )}
            >
              <Icon name="check" size={52} fill />
            </div>
            <div style={s("font-family:'Space Grotesk';font-size:25px;font-weight:700;margin-top:18px;")}>
              Exercice terminé
            </div>
            <div style={s('color:var(--muted);font-size:14px;margin-top:6px;')}>
              {ex.sets} × {ex.reps} · {ex.charge}
            </div>
          </div>
          <button
            onClick={app.nextExercise}
            className="dc-hover-bright"
            style={s(
              "width:100%;border:none;cursor:pointer;background:var(--accent);color:var(--on-accent);font-family:'Space Grotesk';font-weight:700;font-size:15px;padding:16px;border-radius:16px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 28px var(--accent-dim);",
            )}
          >
            Passe au prochain exercice
            <Icon name="arrow_forward" size={20} />
          </button>
          <button
            onClick={app.exitWorkout}
            style={s('margin-top:12px;width:100%;border:none;background:none;color:var(--muted);font-weight:700;font-size:14px;cursor:pointer;padding:6px;')}
          >
            Retour à la séance
          </button>
        </>
      )}
    </div>
  );
}
