import { s } from '../lib/style';
import Icon from '../Icon';
import { exercises } from '../data';
import type { GymApp } from '../useGymApp';

export default function WorkoutOverview({ app }: { app: GymApp }) {
  return (
    <div data-scroll style={s('width:100%;height:100%;overflow-y:auto;padding:10px 20px 26px;')}>
      <div
        style={s(
          'margin:6px 0 2px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:700;',
        )}
      >
        Séance guidée
      </div>
      <div style={s("font-size:25px;font-weight:700;font-family:'Space Grotesk';letter-spacing:-.02em;")}>
        Pectoraux &amp; Triceps
      </div>
      <div style={s('color:var(--muted);font-size:13px;margin-top:4px;')}>6 exercices · 45 min · ~420 kcal</div>
      <div style={s('display:flex;flex-direction:column;gap:12px;margin-top:18px;')}>
        {exercises.map((ex, i) => (
          <div
            key={ex.name}
            onClick={() => app.openExercise(i)}
            className="dc-hover-border"
            style={s(
              'cursor:pointer;display:flex;gap:14px;align-items:center;border-radius:18px;padding:12px;background:var(--surface);border:1px solid var(--line);',
            )}
          >
            <div
              style={s(
                'width:54px;height:54px;border-radius:14px;flex:0 0 auto;background:repeating-linear-gradient(135deg,var(--ph1),var(--ph1) 6px,var(--ph2) 6px,var(--ph2) 12px);display:flex;align-items:center;justify-content:center;color:var(--muted2);',
              )}
            >
              <Icon name="exercise" size={24} />
            </div>
            <div style={s('flex:1;min-width:0;')}>
              <div style={s("font-weight:700;font-size:15px;font-family:'Space Grotesk';")}>{ex.name}</div>
              <div style={s('color:var(--muted);font-size:12.5px;margin-top:3px;')}>
                {ex.sets} × {ex.reps} · {ex.charge}
              </div>
            </div>
            <span
              style={s(
                'font-size:11px;font-weight:700;color:var(--accent);background:var(--accent-dim);padding:4px 9px;border-radius:8px;flex:0 0 auto;',
              )}
            >
              {ex.muscle}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={app.startFirst}
        className="dc-hover-bright"
        style={s(
          "margin-top:20px;width:100%;border:none;cursor:pointer;background:var(--accent);color:var(--on-accent);font-family:'Space Grotesk';font-weight:700;font-size:15px;padding:15px;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 24px var(--accent-dim);",
        )}
      >
        <Icon name="play_arrow" size={20} fill />
        Commencer la séance
      </button>
    </div>
  );
}
