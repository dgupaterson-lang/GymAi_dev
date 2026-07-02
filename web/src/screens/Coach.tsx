import { useEffect, useRef } from 'react';
import { s } from '../lib/style';
import Icon from '../Icon';
import type { GymApp } from '../useGymApp';

const CHIPS = [
  'Je veux perdre 8 kg',
  'Génère mon programme',
  'Analyse ma semaine',
  'Prévois mes résultats',
  'Analyse mon repas',
];

export default function Coach({ app }: { app: GymApp }) {
  const st = app.state;
  const chatRef = useRef<HTMLDivElement>(null);

  // auto-scroll vers le bas à chaque nouveau message (cf. componentDidUpdate de la maquette)
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [st.messages, st.typing]);

  return (
    <div style={s('width:100%;height:100%;display:flex;flex-direction:column;')}>
      <div
        style={s(
          'display:flex;align-items:center;gap:12px;padding:14px 18px 12px;border-bottom:1px solid var(--line2);flex:0 0 auto;',
        )}
      >
        <div
          style={s(
            'width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,var(--violet-dim),var(--accent-dim));display:flex;align-items:center;justify-content:center;color:var(--accent);box-shadow:0 0 16px var(--accent-dim);flex:0 0 auto;',
          )}
        >
          <Icon name="auto_awesome" size={24} fill />
        </div>
        <div style={s('flex:1;')}>
          <div style={s("font-weight:700;font-family:'Space Grotesk';font-size:16px;")}>Coach IA</div>
          <div style={s('display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);margin-top:1px;')}>
            <span style={s('width:7px;height:7px;border-radius:50%;background:var(--online);display:inline-block;box-shadow:0 0 6px var(--online);')} />
            En ligne · répond en temps réel
          </div>
        </div>
      </div>

      <div data-scroll ref={chatRef} style={s('flex:1;overflow-y:auto;padding:18px 18px 8px;')}>
        {st.messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              style={s('display:flex;margin-bottom:14px;justify-content:' + (isUser ? 'flex-end' : 'flex-start') + ';')}
            >
              <div
                style={s(
                  isUser
                    ? 'max-width:80%;padding:11px 15px;border-radius:18px 18px 6px 18px;background:var(--accent);color:var(--on-accent);font-weight:600;font-size:14px;line-height:1.45;'
                    : 'max-width:86%;padding:12px 15px;border-radius:18px 18px 18px 6px;background:var(--surface2);color:var(--txt);border:1px solid var(--line);font-size:14px;line-height:1.5;',
                )}
              >
                <div>{m.text}</div>
                {m.card && (
                  <div
                    style={s(
                      'margin-top:11px;padding-top:11px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:7px;',
                    )}
                  >
                    <div
                      style={s(
                        "font-family:'Space Grotesk';font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);font-weight:700;",
                      )}
                    >
                      {m.card.title}
                    </div>
                    {m.card.rows.map(([k, v], ri) => (
                      <div key={ri} style={s('display:flex;justify-content:space-between;gap:12px;font-size:13px;')}>
                        <span style={s('color:var(--muted);')}>{k}</span>
                        <span style={s('font-weight:700;color:var(--txt);')}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {st.typing && (
          <div style={s('display:flex;margin-bottom:14px;')}>
            <div
              style={s(
                'padding:14px 16px;border-radius:18px 18px 18px 6px;background:var(--surface2);border:1px solid var(--line);display:flex;gap:5px;',
              )}
            >
              <span style={s('width:7px;height:7px;border-radius:50%;background:var(--muted);animation:blink 1s infinite;')} />
              <span style={s('width:7px;height:7px;border-radius:50%;background:var(--muted);animation:blink 1s infinite .2s;')} />
              <span style={s('width:7px;height:7px;border-radius:50%;background:var(--muted);animation:blink 1s infinite .4s;')} />
            </div>
          </div>
        )}
      </div>

      <div data-scroll style={s('display:flex;gap:8px;padding:4px 16px 4px;overflow-x:auto;flex:0 0 auto;')}>
        {CHIPS.map((label) => (
          <button
            key={label}
            onClick={() => app.send(label)}
            className="dc-hover-accent"
            style={s(
              'flex:0 0 auto;border:1px solid var(--line);background:var(--surface);color:var(--txt);font-size:12.5px;font-weight:600;padding:8px 13px;border-radius:18px;cursor:pointer;white-space:nowrap;',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={s('display:flex;gap:10px;padding:10px 16px 16px;align-items:center;flex:0 0 auto;')}>
        <input
          value={st.draft}
          onChange={(e) => app.onDraft(e.target.value)}
          onKeyDown={app.onKey}
          placeholder="Écris à ton coach…"
          style={s(
            "flex:1;border:1px solid var(--line);background:var(--surface);color:var(--txt);font-family:'Hanken Grotesk';font-size:14px;padding:12px 16px;border-radius:22px;outline:none;",
          )}
        />
        <button
          onClick={app.sendBtn}
          style={s(
            'flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;background:var(--accent);color:var(--on-accent);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px var(--accent-dim);',
          )}
        >
          <Icon name="arrow_upward" size={22} fill />
        </button>
      </div>
    </div>
  );
}
