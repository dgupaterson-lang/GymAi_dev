import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { exercises, gymList, coachReply, type Message } from './data';
import { themes, type ThemeName, type ThemeVars } from './theme';
import { deriveAccent } from './theme/deriveAccent';
import { useAuth } from './store/auth';
import { patchProfile } from './api/auth';
import { isNetworkError } from './api/client';
import type { ApiThemeMode, User } from './api/types';

/** Mappe le mode UI ('Dark'|'Rose') vers le format backend ('dark'|'rose'). */
function toApiMode(mode: ThemeName): ApiThemeMode {
  return mode === 'Rose' ? 'rose' : 'dark';
}

/** Mappe le mode backend ('dark'|'rose') vers le mode UI ('Dark'|'Rose'). */
function fromApiMode(mode: ApiThemeMode | undefined): ThemeName {
  return mode === 'rose' ? 'Rose' : 'Dark';
}

export type Phase = 'work' | 'rest' | 'done';
export type Flow = 'welcome' | 'login' | 'gym' | 'onboarding' | 'app';
export type Tab = 'home' | 'workout' | 'coach' | 'profile';
export type WorkoutView = 'overview' | 'exercise' | 'active';

/** Réglages "props" de la maquette (Contenu / Apparence / Comportement). */
const USER_NAME = 'David';
const DEFAULT_MODE: ThemeName = 'Dark';
const DEFAULT_ACCENT = '#5fe3f0';
const VOICE_CUES = true;

/** Choix d'apparence persisté : mode de base + couleur d'accent libre. */
type ThemeChoice = { mode: ThemeName; accent: string };
const THEME_STORAGE_KEY = 'gymai.theme';

/** Restaure le choix d'apparence depuis localStorage (défauts si absent/invalide). */
function loadThemeChoice(): ThemeChoice {
  const fallback: ThemeChoice = { mode: DEFAULT_MODE, accent: DEFAULT_ACCENT };
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ThemeChoice>;
    const mode: ThemeName = parsed.mode === 'Rose' || parsed.mode === 'Dark' ? parsed.mode : DEFAULT_MODE;
    const accent = typeof parsed.accent === 'string' && /^#?[0-9a-fA-F]{3,6}$/.test(parsed.accent) ? parsed.accent : DEFAULT_ACCENT;
    return { mode, accent };
  } catch {
    return fallback;
  }
}

type State = {
  flow: Flow;
  theme: ThemeChoice;
  loginEmail: string;
  loginPass: string;
  gym: number | null;
  onbStep: number;
  objective: string;
  level: string;
  freq: number;
  injury: string;
  generating: boolean;
  planReady: boolean;
  tab: Tab;
  workoutView: WorkoutView;
  activeExercise: number;
  setIndex: number;
  phase: Phase;
  restLeft: number;
  restTotal: number;
  draft: string;
  typing: boolean;
  messages: Message[];
};

const initialState: State = {
  flow: 'welcome',
  theme: loadThemeChoice(),
  loginEmail: 'david@email.com',
  loginPass: 'motdepasse',
  gym: null,
  onbStep: 0,
  objective: 'Perdre du poids',
  level: 'Intermédiaire',
  freq: 4,
  injury: 'Aucune',
  generating: false,
  planReady: false,
  tab: 'home',
  workoutView: 'overview',
  activeExercise: 0,
  setIndex: 0,
  phase: 'work',
  restLeft: 90,
  restTotal: 90,
  draft: '',
  typing: false,
  messages: [
    {
      role: 'coach',
      text: "Salut David. Je suis ton coach IA — donne-moi ton objectif et j'adapte ton programme, ta nutrition et ton planning en temps réel.",
    },
  ],
};

type Patch = Partial<State> | ((s: State) => Partial<State>);

function fmtTime(n: number): string {
  return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
}

export function useGymApp() {
  const [state, setRaw] = useState<State>(initialState);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setState = useCallback((patch: Patch) => {
    setRaw((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const ex = exercises[state.activeExercise];

  // ---- authentification (store partagé) ----
  const auth = useAuth();
  // Débounce du PATCH /me/profile pour la synchro thème.
  const themeSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Quand on hydrate le thème DEPUIS le serveur, on ne veut pas le re-PATCHer :
  // ce drapeau saute la prochaine synchro déclenchée par le changement de thème.
  const skipNextThemeSync = useRef(false);

  /** Applique le thème (mode + accent) issu d'un profil serveur, sans re-synchroniser. */
  const hydrateThemeFromUser = useCallback(
    (user: User | null) => {
      const profile = user?.profile;
      if (!profile) return;
      const mode = fromApiMode(profile.theme_mode);
      const accent =
        typeof profile.accent_color === 'string' &&
        /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(profile.accent_color)
          ? profile.accent_color
          : undefined;
      skipNextThemeSync.current = true;
      setState((s) => ({
        theme: { mode, accent: accent ?? s.theme.accent },
      }));
    },
    [setState],
  );

  // Bootstrap au démarrage : si un token existe, GET /me puis hydrate le thème.
  // Repli gracieux : bootstrap() ne jette pas sur erreur réseau (cf. store).
  useEffect(() => {
    auth
      .bootstrap()
      .then((user) => {
        if (user) hydrateThemeFromUser(user);
      })
      .catch(() => {
        /* jamais censé arriver : bootstrap gère ses erreurs en interne */
      });
    // Volontairement une seule fois au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- minuteur de repos : décrémente chaque seconde tant que phase === 'rest'
  useEffect(() => {
    if (state.phase !== 'rest') return;
    const id = setInterval(() => {
      setState((s) => (s.phase === 'rest' ? { restLeft: Math.max(0, s.restLeft - 1) } : {}));
    }, 1000);
    return () => clearInterval(id);
  }, [state.phase, setState]);

  // ---- fin du repos : annonce vocale + passage à la série suivante
  const announce = useCallback(() => {
    if (!VOICE_CUES) return;
    try {
      if (navigator.vibrate) navigator.vibrate(180);
      const u = new SpeechSynthesisUtterance('Repos terminé. Série suivante.');
      u.lang = 'fr-FR';
      window.speechSynthesis.speak(u);
    } catch {
      /* la synthèse vocale peut être indisponible */
    }
  }, []);

  useEffect(() => {
    if (state.phase === 'rest' && state.restLeft <= 0) {
      announce();
      setState((s) => ({ phase: 'work', setIndex: s.setIndex + 1, restLeft: 0 }));
    }
  }, [state.phase, state.restLeft, announce, setState]);

  // ---- génération du programme par l'IA (onboarding étape 3)
  useEffect(() => {
    if (!state.generating) return;
    const id = setTimeout(() => setState({ generating: false, planReady: true }), 1900);
    return () => clearTimeout(id);
  }, [state.generating, setState]);

  useEffect(() => () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
  }, []);

  // ---- flux d'entrée ----
  const goLogin = useCallback(() => setState({ flow: 'login' }), [setState]);
  const backToWelcome = useCallback(() => setState({ flow: 'welcome' }), [setState]);
  const backToLogin = useCallback(() => setState({ flow: 'login' }), [setState]);
  const onEmail = useCallback((v: string) => setState({ loginEmail: v }), [setState]);
  const onPass = useCallback((v: string) => setState({ loginPass: v }), [setState]);
  /** Continuation du flux (démo/mock) : passe simplement à l'écran de choix de salle. */
  const doLogin = useCallback(() => setState({ flow: 'gym' }), [setState]);

  /**
   * Connexion réelle. Sur succès : hydrate le thème depuis le profil serveur
   * puis continue le flux (flow:'gym'). Sur erreur réseau : repli gracieux
   * (on continue quand même le flux de démo). Sur erreur d'identifiants
   * (400/401) : on relance l'erreur pour que l'écran affiche un message inline.
   */
  const doAuthLogin = useCallback(
    async (email: string, password: string) => {
      try {
        const user = await auth.login({ email, password });
        hydrateThemeFromUser(user);
        setState({ flow: 'gym' });
      } catch (err) {
        if (isNetworkError(err)) {
          // Serveur injoignable : repli gracieux sur le flux de démo.
          console.warn('[GymAI] Connexion API impossible — flux de démo local.');
          setState({ flow: 'gym' });
          return;
        }
        throw err; // 400/401 : géré par l'écran (message inline).
      }
    },
    [auth, hydrateThemeFromUser, setState],
  );

  /** Inscription réelle puis auto-login (mêmes règles de repli que doAuthLogin). */
  const doAuthRegister = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        const user = await auth.register({ email, password, full_name: fullName });
        hydrateThemeFromUser(user);
        setState({ flow: 'gym' });
      } catch (err) {
        if (isNetworkError(err)) {
          console.warn('[GymAI] Inscription API impossible — flux de démo local.');
          setState({ flow: 'gym' });
          return;
        }
        throw err;
      }
    },
    [auth, hydrateThemeFromUser, setState],
  );
  const selectGym = useCallback((i: number) => setState({ gym: i }), [setState]);
  const gymContinue = useCallback(
    () => setState((s) => (s.gym != null ? { flow: 'onboarding', onbStep: 0 } : {})),
    [setState],
  );
  const setObjective = useCallback((o: string) => setState({ objective: o }), [setState]);
  const setLevel = useCallback((l: string) => setState({ level: l }), [setState]);
  const setInjury = useCallback((i: string) => setState({ injury: i }), [setState]);
  const freqMinus = useCallback(() => setState((s) => ({ freq: Math.max(2, s.freq - 1) })), [setState]);
  const freqPlus = useCallback(() => setState((s) => ({ freq: Math.min(6, s.freq + 1) })), [setState]);
  const onbBack = useCallback(
    () =>
      setState((s) =>
        s.onbStep > 0
          ? { onbStep: s.onbStep - 1, generating: false, planReady: false }
          : { flow: 'gym' },
      ),
    [setState],
  );
  const onbNext = useCallback(
    () =>
      setState((s) => {
        if (s.onbStep === 0) return { onbStep: 1 };
        if (s.onbStep === 1) return { onbStep: 2, generating: true, planReady: false };
        return {};
      }),
    [setState],
  );
  const finishOnb = useCallback(() => setState({ flow: 'app', tab: 'home' }), [setState]);
  const logout = useCallback(() => {
    // Déconnexion serveur best-effort (ne bloque pas le retour Welcome).
    void auth.logout();
    setState({ flow: 'welcome' });
  }, [auth, setState]);

  // ---- navigation app ----
  const go = useCallback(
    (tab: Tab) => setState(tab === 'workout' ? { tab, workoutView: 'overview' } : { tab }),
    [setState],
  );
  const goCoach = useCallback(() => go('coach'), [go]);
  const startWorkout = useCallback(
    () => setState({ tab: 'workout', workoutView: 'exercise', activeExercise: 0 }),
    [setState],
  );
  const openExercise = useCallback(
    (i: number) => setState({ activeExercise: i, workoutView: 'exercise' }),
    [setState],
  );
  const startFirst = useCallback(() => openExercise(0), [openExercise]);
  const backOverview = useCallback(() => setState({ workoutView: 'overview' }), [setState]);
  const beginExercise = useCallback(() => {
    const e = exercises[state.activeExercise];
    setState({ workoutView: 'active', phase: 'work', setIndex: 0, restTotal: e.rest, restLeft: e.rest });
  }, [setState, state.activeExercise]);
  const exitWorkout = useCallback(() => setState({ workoutView: 'overview' }), [setState]);

  const startRest = useCallback(() => {
    const e = exercises[state.activeExercise];
    setState({ phase: 'rest', restTotal: e.rest, restLeft: e.rest });
  }, [setState, state.activeExercise]);
  const validateSet = useCallback(() => {
    const e = exercises[state.activeExercise];
    if (state.setIndex >= e.sets - 1) setState({ phase: 'done' });
    else startRest();
  }, [setState, startRest, state.activeExercise, state.setIndex]);
  const minus15 = useCallback(() => setState((s) => ({ restLeft: Math.max(1, s.restLeft - 15) })), [setState]);
  const plus15 = useCallback(
    () => setState((s) => ({ restLeft: s.restLeft + 15, restTotal: Math.max(s.restTotal, s.restLeft + 15) })),
    [setState],
  );
  const skipRest = useCallback(() => {
    announce();
    setState((s) => ({ phase: 'work', restLeft: 0, setIndex: s.setIndex + 1 }));
  }, [announce, setState]);
  const nextExercise = useCallback(() => {
    const n = state.activeExercise + 1;
    if (n >= exercises.length) setState({ workoutView: 'overview' });
    else {
      const e = exercises[n];
      setState({
        activeExercise: n,
        workoutView: 'active',
        phase: 'work',
        setIndex: 0,
        restTotal: e.rest,
        restLeft: e.rest,
      });
    }
  }, [setState, state.activeExercise]);

  // ---- coach ----
  const onDraft = useCallback((v: string) => setState({ draft: v }), [setState]);
  const send = useCallback(
    (text?: string) => {
      const t = (text != null ? text : state.draft).trim();
      if (!t) return;
      setState((s) => ({ messages: [...s.messages, { role: 'user', text: t }], draft: '', typing: true }));
      if (replyTimer.current) clearTimeout(replyTimer.current);
      replyTimer.current = setTimeout(() => {
        const reply = coachReply(t);
        setState((s) => ({ messages: [...s.messages, reply], typing: false }));
      }, 950);
    },
    [setState, state.draft],
  );
  const sendBtn = useCallback(() => send(), [send]);
  const onKey = useCallback(
    (e: { key: string }) => {
      if (e.key === 'Enter') send();
    },
    [send],
  );

  // ---- apparence : mode de base (Dark/Rose) + couleur d'accent libre ----
  const setMode = useCallback((mode: ThemeName) => setState((s) => ({ theme: { ...s.theme, mode } })), [setState]);
  const setAccent = useCallback((accent: string) => setState((s) => ({ theme: { ...s.theme, accent } })), [setState]);
  /** Compat : ancien toggle Dark/Rose -> change le mode de base. */
  const setTheme = setMode;

  // Persiste le choix d'apparence à chaque changement (cache local / offline).
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state.theme));
    } catch {
      /* localStorage peut être indisponible (mode privé) */
    }
  }, [state.theme]);

  // Synchro thème serveur : quand connecté, tout changement de mode/accent
  // déclenche un PATCH /me/profile débouncé (~500 ms). Le localStorage ci-dessus
  // reste le cache offline. On saute la synchro juste après une hydratation
  // depuis le serveur (skipNextThemeSync) pour éviter un aller-retour inutile.
  useEffect(() => {
    if (!auth.isAuthenticated) return;
    if (skipNextThemeSync.current) {
      skipNextThemeSync.current = false;
      return;
    }
    if (themeSyncTimer.current) clearTimeout(themeSyncTimer.current);
    const snapshot = state.theme;
    themeSyncTimer.current = setTimeout(() => {
      patchProfile({
        theme_mode: toApiMode(snapshot.mode),
        accent_color: snapshot.accent,
      }).catch((err) => {
        // Repli gracieux : un échec (réseau/validation) ne casse rien ;
        // le cache local reste la source de vérité hors ligne.
        if (isNetworkError(err)) {
          console.warn('[GymAI] Synchro thème impossible (serveur injoignable).');
        } else {
          console.warn('[GymAI] Synchro thème refusée par le serveur.');
        }
      });
    }, 500);
    return () => {
      if (themeSyncTimer.current) clearTimeout(themeSyncTimer.current);
    };
  }, [state.theme, auth.isAuthenticated]);

  // ---- valeurs dérivées ----
  const effTheme: ThemeName = state.theme.mode;
  // Tokens du mode de base, dont la famille accent est REMPLACÉE par deriveAccent(accent).
  const vars: ThemeVars = useMemo(() => {
    const base = themes[effTheme] || themes.Dark;
    const a = deriveAccent(state.theme.accent);
    return {
      ...base,
      '--accent': a.accent,
      '--accent-glow': a.accentGlow,
      '--accent-dim': a.accentDim,
      '--on-accent': a.onAccent,
    };
  }, [effTheme, state.theme.accent]);
  const name = (USER_NAME || 'David').trim() || 'David';
  const initial = name[0].toUpperCase();
  const gymName = useMemo(
    () => (state.gym != null ? gymList[state.gym].name : 'GymAI Plateau'),
    [state.gym],
  );

  return {
    state,
    ex,
    effTheme,
    accent: state.theme.accent,
    vars,
    voiceOn: VOICE_CUES,
    name,
    initial,
    gymName,
    fmtTime,
    // auth
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    // handlers
    goLogin,
    backToWelcome,
    backToLogin,
    onEmail,
    onPass,
    doLogin,
    doAuthLogin,
    doAuthRegister,
    selectGym,
    gymContinue,
    setObjective,
    setLevel,
    setInjury,
    freqMinus,
    freqPlus,
    onbBack,
    onbNext,
    finishOnb,
    logout,
    go,
    goCoach,
    startWorkout,
    openExercise,
    startFirst,
    backOverview,
    beginExercise,
    exitWorkout,
    validateSet,
    minus15,
    plus15,
    skipRest,
    nextExercise,
    onDraft,
    send,
    sendBtn,
    onKey,
    setTheme,
    setMode,
    setAccent,
  };
}

export type GymApp = ReturnType<typeof useGymApp>;
