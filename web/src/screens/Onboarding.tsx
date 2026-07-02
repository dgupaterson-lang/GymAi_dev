import { s } from '../lib/style';
import Icon from '../Icon';
import type { GymApp } from '../useGymApp';

const OBJECTIVES: [string, string][] = [
  ['Perdre du poids', 'monitor_weight'],
  ['Prendre du muscle', 'exercise'],
  ['Forme & tonus', 'self_improvement'],
  ['Endurance', 'directions_run'],
];
const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];
const INJURIES = ['Aucune', 'Genou', 'Épaule', 'Dos'];

export default function Onboarding({ app }: { app: GymApp }) {
  const st = app.state;
  const progress = (st.onbStep === 0 ? 33 : st.onbStep === 1 ? 66 : 100) + '%';
  const planSummary =
    st.objective + ' · ' + st.level.toLowerCase() + ' · ' + st.freq + ' séances par semaine.';

  const primaryBtn =
    "width:100%;border:none;cursor:pointer;background:var(--accent);color:var(--on-accent);font-family:'Space Grotesk';font-weight:700;font-size:15px;padding:16px;border-radius:15px;box-shadow:0 10px 28px var(--accent-dim);";

  return (
    <div style={s('width:100%;height:100%;display:flex;flex-direction:column;')}>
      <div style={s('flex:0 0 auto;padding:10px 24px 4px;')}>
        <div style={s('display:flex;align-items:center;gap:12px;')}>
          <button
            onClick={app.onbBack}
            style={s(
              'border:none;background:var(--surface2);color:var(--txt);width:38px;height:38px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;',
            )}
          >
            <Icon name="arrow_back" />
          </button>
          <div style={s('flex:1;height:6px;border-radius:4px;background:var(--surface2);overflow:hidden;')}>
            <div
              style={{
                ...s(
                  'height:100%;border-radius:4px;background:var(--accent);transition:width .3s;box-shadow:0 0 8px var(--accent-glow);',
                ),
                width: progress,
              }}
            />
          </div>
        </div>
      </div>

      <div data-scroll style={s('flex:1;overflow-y:auto;padding:14px 24px 14px;')}>
        {/* étape 0 — objectif */}
        {st.onbStep === 0 && (
          <>
            <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:25px;letter-spacing:-.02em;")}>
              Quel est ton objectif ?
            </div>
            <div style={s('color:var(--muted);font-size:14px;margin-top:6px;')}>
              L'IA construit ton programme autour de ça.
            </div>
            <div style={s('display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;')}>
              {OBJECTIVES.map(([label, ic]) => {
                const active = st.objective === label;
                return (
                  <div
                    key={label}
                    onClick={() => app.setObjective(label)}
                    style={s(
                      'display:flex;flex-direction:column;gap:12px;padding:18px;border-radius:18px;cursor:pointer;background:' +
                        (active ? 'var(--accent-dim)' : 'var(--surface)') +
                        ';border:1.5px solid ' +
                        (active ? 'var(--accent)' : 'var(--line)') +
                        ';transition:all .2s;',
                    )}
                  >
                    <Icon name={ic} size={30} fill={active} color={active ? 'var(--accent)' : 'var(--muted)'} />
                    <span style={s("font-weight:700;font-size:14px;font-family:'Space Grotesk';")}>{label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* étape 1 — profil */}
        {st.onbStep === 1 && (
          <>
            <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:25px;letter-spacing:-.02em;")}>
              Parle-moi de toi
            </div>
            <div style={s('color:var(--muted);font-size:14px;margin-top:6px;')}>
              Pour calibrer l'intensité et les charges.
            </div>

            <div
              style={s(
                'font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);font-weight:700;margin:22px 0 9px;',
              )}
            >
              Ton niveau
            </div>
            <div
              style={s(
                'display:flex;gap:6px;padding:5px;background:var(--surface);border:1px solid var(--line);border-radius:14px;',
              )}
            >
              {LEVELS.map((label) => {
                const active = st.level === label;
                return (
                  <div
                    key={label}
                    onClick={() => app.setLevel(label)}
                    style={s(
                      "flex:1;text-align:center;padding:11px 4px;border-radius:11px;cursor:pointer;font-weight:700;font-size:12.5px;font-family:'Space Grotesk';background:" +
                        (active ? 'var(--accent)' : 'transparent') +
                        ';color:' +
                        (active ? 'var(--on-accent)' : 'var(--muted)') +
                        ';transition:all .2s;',
                    )}
                  >
                    {label}
                  </div>
                );
              })}
            </div>

            <div
              style={s(
                'font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);font-weight:700;margin:22px 0 9px;',
              )}
            >
              Séances par semaine
            </div>
            <div
              style={s(
                'display:flex;align-items:center;justify-content:space-between;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:12px 16px;',
              )}
            >
              <button
                onClick={app.freqMinus}
                style={s(
                  'width:42px;height:42px;border-radius:11px;border:1px solid var(--line);background:var(--surface2);color:var(--txt);font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;',
                )}
              >
                <Icon name="remove" />
              </button>
              <div style={s('text-align:center;')}>
                <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:34px;line-height:1;")}>
                  {st.freq}
                </div>
                <div style={s('font-size:11px;color:var(--muted);margin-top:2px;')}>séances</div>
              </div>
              <button
                onClick={app.freqPlus}
                style={s(
                  'width:42px;height:42px;border-radius:11px;border:1px solid var(--line);background:var(--surface2);color:var(--txt);font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;',
                )}
              >
                <Icon name="add" />
              </button>
            </div>

            <div
              style={s(
                'font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);font-weight:700;margin:22px 0 9px;',
              )}
            >
              Blessures / limitations
            </div>
            <div style={s('display:flex;flex-wrap:wrap;gap:8px;')}>
              {INJURIES.map((label) => {
                const active = st.injury === label;
                return (
                  <div
                    key={label}
                    onClick={() => app.setInjury(label)}
                    style={s(
                      'cursor:pointer;font-size:13px;font-weight:600;padding:9px 15px;border-radius:20px;border:1.5px solid ' +
                        (active ? 'var(--accent)' : 'var(--line)') +
                        ';background:' +
                        (active ? 'var(--accent-dim)' : 'var(--surface)') +
                        ';color:' +
                        (active ? 'var(--accent)' : 'var(--muted)') +
                        ';transition:all .2s;',
                    )}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* étape 2 — génération / programme prêt */}
        {st.onbStep === 2 && (
          <div
            style={s(
              'height:100%;min-height:440px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;',
            )}
          >
            {st.generating && (
              <>
                <div
                  style={s(
                    'width:96px;height:96px;border-radius:50%;border:5px solid var(--line);border-top-color:var(--accent);animation:spin .9s linear infinite;box-shadow:0 0 26px var(--accent-dim);',
                  )}
                />
                <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:21px;margin-top:24px;")}>
                  L'IA construit ton programme…
                </div>
                <div
                  style={s(
                    'display:flex;flex-direction:column;gap:8px;margin-top:18px;color:var(--muted);font-size:13.5px;',
                  )}
                >
                  <div style={s('display:flex;align-items:center;gap:8px;')}>
                    <Icon name="check_circle" size={17} color="var(--accent)" />
                    Analyse de ton profil
                  </div>
                  <div style={s('display:flex;align-items:center;gap:8px;')}>
                    <Icon name="check_circle" size={17} color="var(--accent)" />
                    Sélection des exercices
                  </div>
                  <div style={s('display:flex;align-items:center;gap:8px;')}>
                    <Icon name="pending" size={17} color="var(--muted2)" />
                    Calibrage des charges
                  </div>
                </div>
              </>
            )}
            {st.planReady && (
              <>
                <div
                  style={s(
                    'width:92px;height:92px;border-radius:50%;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;color:var(--accent);box-shadow:0 0 34px var(--accent-glow);',
                  )}
                >
                  <Icon name="check" size={54} fill />
                </div>
                <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:24px;margin-top:20px;")}>
                  Ton programme est prêt
                </div>
                <div
                  style={s('color:var(--muted);font-size:14px;margin-top:8px;line-height:1.5;max-width:260px;')}
                >
                  {planSummary}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={s('flex:0 0 auto;padding:12px 24px 18px;border-top:1px solid var(--line2);')}>
        {st.onbStep < 2 && (
          <button onClick={app.onbNext} className="dc-hover-bright" style={s(primaryBtn)}>
            Continuer
          </button>
        )}
        {st.planReady && (
          <button onClick={app.finishOnb} className="dc-hover-bright" style={s(primaryBtn)}>
            Découvrir mon espace
          </button>
        )}
      </div>
    </div>
  );
}
