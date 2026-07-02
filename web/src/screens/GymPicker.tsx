import { s } from '../lib/style';
import Icon from '../Icon';
import { gymList } from '../data';
import type { GymApp } from '../useGymApp';

export default function GymPicker({ app }: { app: GymApp }) {
  const selected = app.state.gym;
  const btnStyle =
    "width:100%;border:none;cursor:pointer;font-family:'Space Grotesk';font-weight:700;font-size:15px;padding:16px;border-radius:15px;transition:all .2s;" +
    (selected != null
      ? 'background:var(--accent);color:var(--on-accent);box-shadow:0 10px 28px var(--accent-dim);'
      : 'background:var(--surface2);color:var(--muted2);');

  return (
    <div style={s('width:100%;height:100%;display:flex;flex-direction:column;')}>
      <div data-scroll style={s('flex:1;overflow-y:auto;padding:8px 24px 14px;')}>
        <button
          onClick={app.backToLogin}
          style={s(
            'border:none;background:var(--surface2);color:var(--txt);width:38px;height:38px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin:4px 0 16px;',
          )}
        >
          <Icon name="arrow_back" />
        </button>
        <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:25px;letter-spacing:-.02em;")}>
          Choisis ta salle
        </div>
        <div style={s('color:var(--muted);font-size:14px;margin-top:6px;')}>
          Sélectionne ta salle GymAI pour personnaliser ton expérience.
        </div>
        <div
          style={s(
            'display:flex;align-items:center;gap:10px;margin-top:16px;border:1px solid var(--line);background:var(--surface);border-radius:14px;padding:12px 14px;',
          )}
        >
          <Icon name="search" size={20} color="var(--muted2)" />
          <span style={s('color:var(--muted2);font-size:14px;')}>Rechercher une salle, une ville…</span>
        </div>
        <div style={s('display:flex;flex-direction:column;gap:12px;margin-top:18px;')}>
          {gymList.map((g, i) => {
            const active = selected === i;
            return (
              <div
                key={g.name}
                onClick={() => app.selectGym(i)}
                style={s(
                  'cursor:pointer;display:flex;gap:14px;align-items:center;border-radius:18px;padding:12px;background:' +
                    (active ? 'var(--accent-dim)' : 'var(--surface)') +
                    ';border:1.5px solid ' +
                    (active ? 'var(--accent)' : 'var(--line)') +
                    ';transition:all .2s;',
                )}
              >
                <div
                  style={s(
                    'width:62px;height:62px;border-radius:14px;flex:0 0 auto;background:repeating-linear-gradient(135deg,var(--ph1),var(--ph1) 7px,var(--ph2) 7px,var(--ph2) 14px);display:flex;align-items:center;justify-content:center;color:var(--muted2);',
                  )}
                >
                  <Icon name="fitness_center" size={26} />
                </div>
                <div style={s('flex:1;min-width:0;')}>
                  <div style={s("font-weight:700;font-size:15.5px;font-family:'Space Grotesk';")}>{g.name}</div>
                  <div style={s('color:var(--muted);font-size:12.5px;margin-top:3px;')}>{g.addr}</div>
                  <div style={s('display:flex;gap:12px;margin-top:7px;font-size:12px;font-weight:600;')}>
                    <span style={s('display:flex;align-items:center;gap:3px;color:var(--muted);')}>
                      <Icon name="near_me" size={15} />
                      {g.dist}
                    </span>
                    <span style={s('display:flex;align-items:center;gap:3px;color:var(--accent);')}>
                      <Icon name="star" size={15} fill />
                      {g.rating}
                    </span>
                    <span
                      style={s(
                        'display:flex;align-items:center;gap:3px;color:' +
                          (g.open ? 'var(--good)' : 'var(--muted2)') +
                          ';',
                      )}
                    >
                      {g.open ? 'Ouvert' : 'Fermé'}
                    </span>
                  </div>
                </div>
                <span
                  style={s(
                    'flex:0 0 auto;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--on-accent);background:' +
                      (active ? 'var(--accent)' : 'transparent') +
                      ';opacity:' +
                      (active ? 1 : 0) +
                      ';transition:opacity .2s;',
                  )}
                >
                  <Icon name="check" size={18} fill />
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={s('flex:0 0 auto;padding:12px 24px 18px;border-top:1px solid var(--line2);')}>
        <button onClick={app.gymContinue} style={s(btnStyle)}>
          Continuer
        </button>
      </div>
    </div>
  );
}
