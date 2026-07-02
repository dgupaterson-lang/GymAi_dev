import { s } from '../lib/style';
import ColorPicker from './ColorPicker';
import LogoMark from './LogoMark';
import type { GymApp } from '../useGymApp';

export default function Welcome({ app }: { app: GymApp }) {
  return (
    <div style={s('position:relative;width:100%;height:100%;overflow:hidden;')}>
      <div
        style={s(
          'position:absolute;inset:0;background:repeating-linear-gradient(135deg,var(--ph2),var(--ph2) 13px,var(--ph3) 13px,var(--ph3) 26px);',
        )}
      />
      <div
        style={s(
          "position:absolute;top:14px;left:18px;font-family:'Space Grotesk';font-size:10px;letter-spacing:.12em;color:var(--muted2);text-transform:uppercase;",
        )}
      >
        photo lifestyle · athlète
      </div>
      <div
        style={s('position:absolute;inset:0;background:linear-gradient(to bottom, transparent 16%, var(--bg) 70%);')}
      />
      <div style={s('position:absolute;left:0;right:0;bottom:0;padding:26px 24px 28px;')}>
        <div style={s('display:flex;align-items:center;gap:10px;margin-bottom:18px;')}>
          <LogoMark accent={app.accent} size={40} />
          <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:22px;letter-spacing:-.02em;")}>
            Gym<span style={{ color: 'var(--accent)' }}>AI</span>
          </div>
        </div>
        <div
          style={s(
            "font-family:'Space Grotesk';font-weight:700;font-size:30px;line-height:1.1;letter-spacing:-.03em;",
          )}
        >
          Ton coach intelligent, à chaque répétition.
        </div>
        <div style={s('color:var(--muted);font-size:14px;margin-top:10px;line-height:1.5;')}>
          Programmes générés par l'IA, suivi en temps réel, nutrition et coaching — dans une seule app.
        </div>

        <div
          style={s(
            'font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted2);font-weight:700;margin:22px 0 9px;',
          )}
        >
          Choisis ton ambiance
        </div>
        <ColorPicker app={app} />

        <button
          onClick={app.goLogin}
          className="dc-hover-bright"
          style={s(
            "margin-top:22px;width:100%;border:none;cursor:pointer;background:var(--accent);color:var(--on-accent);font-family:'Space Grotesk';font-weight:700;font-size:15px;padding:16px;border-radius:15px;box-shadow:0 10px 28px var(--accent-dim);",
          )}
        >
          Créer un compte
        </button>
        <button
          onClick={app.goLogin}
          className="dc-hover-border"
          style={s(
            "margin-top:10px;width:100%;border:1px solid var(--line);background:transparent;color:var(--txt);font-family:'Space Grotesk';font-weight:700;font-size:15px;padding:15px;border-radius:15px;cursor:pointer;",
          )}
        >
          J'ai déjà un compte
        </button>
        <div style={s('text-align:center;color:var(--muted2);font-size:12px;margin-top:14px;')}>
          Déjà 12 000 sportifs accompagnés par l'IA
        </div>
      </div>
    </div>
  );
}
