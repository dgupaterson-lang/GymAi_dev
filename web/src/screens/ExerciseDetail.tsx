import { s } from '../lib/style';
import Icon from '../Icon';
import { exercises } from '../data';
import type { GymApp } from '../useGymApp';

export default function ExerciseDetail({ app }: { app: GymApp }) {
  const ex = app.ex;
  const num = app.state.activeExercise + 1;
  const total = exercises.length;

  return (
    <div data-scroll style={s('width:100%;height:100%;overflow-y:auto;padding:10px 20px 26px;')}>
      <div style={s('display:flex;align-items:center;gap:10px;margin:6px 0 14px;')}>
        <button
          onClick={app.backOverview}
          style={s(
            'border:none;background:var(--surface2);color:var(--txt);width:38px;height:38px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;',
          )}
        >
          <Icon name="arrow_back" />
        </button>
        <div style={s('font-size:13px;color:var(--muted);font-weight:600;')}>
          Exercice {num} / {total}
        </div>
      </div>

      <div
        style={s(
          'position:relative;width:100%;aspect-ratio:16/10;border-radius:18px;overflow:hidden;background:repeating-linear-gradient(135deg,var(--ph2),var(--ph2) 10px,var(--ph3) 10px,var(--ph3) 20px);display:flex;align-items:center;justify-content:center;border:1px solid var(--line);',
        )}
      >
        <div
          style={s(
            "position:absolute;bottom:10px;left:12px;font-family:'Space Grotesk';font-size:10px;letter-spacing:.12em;color:var(--muted2);text-transform:uppercase;",
          )}
        >
          vidéo HD · démonstration
        </div>
        <div
          style={s(
            'width:58px;height:58px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:var(--on-accent);box-shadow:0 0 26px var(--accent-glow);',
          )}
        >
          <Icon name="play_arrow" size={32} fill />
        </div>
      </div>
      <div style={s("font-size:23px;font-weight:700;font-family:'Space Grotesk';margin-top:16px;letter-spacing:-.02em;")}>
        {ex.name}
      </div>

      <div
        style={s(
          'font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);font-weight:700;margin:16px 0 8px;',
        )}
      >
        Muscles sollicités
      </div>
      <div style={s('display:flex;flex-wrap:wrap;gap:8px;')}>
        {ex.muscles.map((m) => (
          <span
            key={m}
            style={s(
              'font-size:12.5px;font-weight:600;color:var(--accent);background:var(--accent-dim);padding:6px 12px;border-radius:10px;',
            )}
          >
            {m}
          </span>
        ))}
      </div>

      <div style={s('display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:18px;')}>
        <div style={s('border-radius:16px;padding:14px;background:var(--surface);border:1px solid var(--line);text-align:center;')}>
          <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:24px;")}>{ex.sets}</div>
          <div style={s('font-size:11px;color:var(--muted);margin-top:3px;')}>séries</div>
        </div>
        <div style={s('border-radius:16px;padding:14px;background:var(--surface);border:1px solid var(--line);text-align:center;')}>
          <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:24px;")}>{ex.reps}</div>
          <div style={s('font-size:11px;color:var(--muted);margin-top:3px;')}>répétitions</div>
        </div>
        <div style={s('border-radius:16px;padding:14px;background:var(--surface);border:1px solid var(--line);text-align:center;')}>
          <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:24px;")}>
            {ex.rest}
            <span style={s('font-size:13px;color:var(--muted2);')}>s</span>
          </div>
          <div style={s('font-size:11px;color:var(--muted);margin-top:3px;')}>repos</div>
        </div>
      </div>

      <div
        style={s(
          'font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);font-weight:700;margin:20px 0 8px;',
        )}
      >
        Erreurs à éviter
      </div>
      <div style={s('display:flex;flex-direction:column;gap:10px;')}>
        {ex.tips.map((tip) => (
          <div
            key={tip}
            style={s(
              'display:flex;gap:10px;align-items:flex-start;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px 14px;',
            )}
          >
            <Icon name="error" size={18} color="var(--warn)" fill style={s('flex:0 0 auto;')} />
            <span style={s('font-size:13.5px;line-height:1.45;color:var(--txt);')}>{tip}</span>
          </div>
        ))}
      </div>

      <button
        onClick={app.beginExercise}
        className="dc-hover-bright"
        style={s(
          "margin-top:22px;width:100%;border:none;cursor:pointer;background:var(--accent);color:var(--on-accent);font-family:'Space Grotesk';font-weight:700;font-size:15px;padding:15px;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 24px var(--accent-dim);",
        )}
      >
        <Icon name="play_arrow" size={20} fill />
        Commencer l'exercice
      </button>
    </div>
  );
}
