import { useState } from 'react';
import { s } from '../lib/style';
import Icon from '../Icon';
import { extractApiError } from '../api/client';
import type { GymApp } from '../useGymApp';

export default function Login({ app }: { app: GymApp }) {
  // Bascule connexion / inscription.
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  const submit = async () => {
    setError(null);
    const email = app.state.loginEmail.trim();
    const pass = app.state.loginPass;
    if (!email || !pass || (isRegister && !fullName.trim())) {
      setError('Merci de remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await app.doAuthRegister(email, pass, fullName.trim());
      } else {
        await app.doAuthLogin(email, pass);
      }
      // Succès : useGymApp continue le flux (flow -> 'gym'), cet écran est démonté.
    } catch (err) {
      setError(extractApiError(err, isRegister ? 'Inscription impossible.' : 'Identifiants invalides.'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError(null);
    setMode((m) => (m === 'login' ? 'register' : 'login'));
  };

  return (
    <div data-scroll style={s('width:100%;height:100%;overflow-y:auto;padding:8px 24px 26px;')}>
      <button
        onClick={app.backToWelcome}
        style={s(
          'border:none;background:var(--surface2);color:var(--txt);width:38px;height:38px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;margin:4px 0 18px;',
        )}
      >
        <Icon name="arrow_back" />
      </button>
      <div style={s("font-family:'Space Grotesk';font-weight:700;font-size:27px;letter-spacing:-.02em;")}>
        {isRegister ? 'Crée ton compte' : 'Content de te revoir'}
      </div>
      <div style={s('color:var(--muted);font-size:14px;margin-top:6px;')}>
        {isRegister
          ? 'Rejoins GymAI et démarre ta progression.'
          : 'Connecte-toi pour reprendre ta progression.'}
      </div>

      {isRegister && (
        <div style={s('margin-top:22px;')}>
          <label style={s('font-size:12px;font-weight:700;color:var(--muted);letter-spacing:.04em;')}>Nom complet</label>
          <div
            style={s(
              'display:flex;align-items:center;gap:10px;margin-top:7px;border:1px solid var(--line);background:var(--surface);border-radius:14px;padding:0 14px;',
            )}
          >
            <Icon name="person" size={20} color="var(--muted2)" />
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ton nom"
              style={s(
                "flex:1;border:none;background:transparent;color:var(--txt);font-family:'Hanken Grotesk';font-size:15px;padding:14px 0;outline:none;",
              )}
            />
          </div>
        </div>
      )}

      <div style={s(isRegister ? 'margin-top:16px;' : 'margin-top:26px;')}>
        <label style={s('font-size:12px;font-weight:700;color:var(--muted);letter-spacing:.04em;')}>E-mail</label>
        <div
          style={s(
            'display:flex;align-items:center;gap:10px;margin-top:7px;border:1px solid var(--line);background:var(--surface);border-radius:14px;padding:0 14px;',
          )}
        >
          <Icon name="mail" size={20} color="var(--muted2)" />
          <input
            value={app.state.loginEmail}
            onChange={(e) => app.onEmail(e.target.value)}
            style={s(
              "flex:1;border:none;background:transparent;color:var(--txt);font-family:'Hanken Grotesk';font-size:15px;padding:14px 0;outline:none;",
            )}
          />
        </div>
      </div>
      <div style={s('margin-top:16px;')}>
        <label style={s('font-size:12px;font-weight:700;color:var(--muted);letter-spacing:.04em;')}>
          Mot de passe
        </label>
        <div
          style={s(
            'display:flex;align-items:center;gap:10px;margin-top:7px;border:1px solid var(--line);background:var(--surface);border-radius:14px;padding:0 14px;',
          )}
        >
          <Icon name="lock" size={20} color="var(--muted2)" />
          <input
            type="password"
            value={app.state.loginPass}
            onChange={(e) => app.onPass(e.target.value)}
            style={s(
              "flex:1;border:none;background:transparent;color:var(--txt);font-family:'Hanken Grotesk';font-size:15px;padding:14px 0;outline:none;letter-spacing:2px;",
            )}
          />
        </div>
      </div>

      {!isRegister && (
        <div style={s('text-align:right;margin-top:10px;font-size:13px;font-weight:700;color:var(--accent);')}>
          Mot de passe oublié ?
        </div>
      )}

      {/* Message d'erreur inline */}
      {error && (
        <div
          role="alert"
          style={s(
            'margin-top:14px;font-size:13px;font-weight:600;color:var(--warn);background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;',
          )}
        >
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="dc-hover-bright"
        style={{
          ...s(
            "margin-top:18px;width:100%;border:none;background:var(--accent);color:var(--on-accent);font-family:'Space Grotesk';font-weight:700;font-size:15px;padding:16px;border-radius:15px;box-shadow:0 10px 28px var(--accent-dim);",
          ),
          cursor: loading ? 'progress' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Un instant…' : isRegister ? 'Créer mon compte' : 'Se connecter'}
      </button>

      {/* Bascule connexion / inscription */}
      <div style={s('text-align:center;margin-top:16px;font-size:13.5px;color:var(--muted);')}>
        {isRegister ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
        <span onClick={toggleMode} style={s('font-weight:700;color:var(--accent);cursor:pointer;')}>
          {isRegister ? 'Se connecter' : 'Créer un compte'}
        </span>
      </div>

      <div
        style={s(
          'display:flex;align-items:center;gap:12px;margin:22px 0;color:var(--muted2);font-size:12px;font-weight:600;',
        )}
      >
        <div style={s('flex:1;height:1px;background:var(--line);')} />
        ou continuer avec
        <div style={s('flex:1;height:1px;background:var(--line);')} />
      </div>
      <div style={s('display:flex;gap:10px;')}>
        <button
          onClick={app.doLogin}
          className="dc-hover-border"
          style={s(
            'flex:1;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--line);background:var(--surface);color:var(--txt);font-weight:700;font-size:14px;padding:13px;border-radius:14px;cursor:pointer;',
          )}
        >
          <Icon name="account_circle" size={19} />
          Google
        </button>
        <button
          onClick={app.doLogin}
          className="dc-hover-border"
          style={s(
            'flex:1;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--line);background:var(--surface);color:var(--txt);font-weight:700;font-size:14px;padding:13px;border-radius:14px;cursor:pointer;',
          )}
        >
          <Icon name="phone_iphone" size={19} />
          Mobile Money
        </button>
      </div>
    </div>
  );
}
