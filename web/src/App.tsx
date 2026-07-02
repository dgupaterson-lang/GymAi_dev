import { s } from './lib/style';
import Icon from './Icon';
import { useGymApp } from './useGymApp';
import Welcome from './screens/Welcome';
import Login from './screens/Login';
import GymPicker from './screens/GymPicker';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import WorkoutOverview from './screens/WorkoutOverview';
import ExerciseDetail from './screens/ExerciseDetail';
import ActiveSet from './screens/ActiveSet';
import Coach from './screens/Coach';
import Profile from './screens/Profile';
import BottomNav from './screens/BottomNav';

export default function App() {
  const app = useGymApp();
  const { state, vars } = app;
  const flow = state.flow;
  const inApp = flow === 'app';
  const showActive = inApp && state.tab === 'workout' && state.workoutView === 'active';
  const showNav = inApp && !showActive;

  return (
    <div
      style={{
        ...vars,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'var(--stage-bg)',
        fontFamily: "'Hanken Grotesk',system-ui,sans-serif",
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* halo lumineux derrière le téléphone */}
        <div
          style={s(
            'position:absolute;inset:-60px;background:radial-gradient(circle at 50% 38%, var(--accent-glow), transparent 68%);filter:blur(46px);opacity:.5;z-index:0;border-radius:80px;',
          )}
        />
        {/* châssis */}
        <div
          style={s(
            'position:relative;z-index:1;width:392px;height:846px;border-radius:50px;background:var(--shell);padding:6px;box-shadow:0 44px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);',
          )}
        >
          <div
            style={s(
              'width:100%;height:100%;border-radius:44px;overflow:hidden;background:var(--bg);display:flex;flex-direction:column;position:relative;color:var(--txt);',
            )}
          >
            {/* dynamic island */}
            <div
              style={s(
                'position:absolute;top:11px;left:50%;transform:translateX(-50%);width:110px;height:30px;background:var(--island);border-radius:18px;z-index:60;',
              )}
            />

            {/* barre d'état */}
            <div
              style={s(
                "display:flex;justify-content:space-between;align-items:center;padding:15px 28px 7px;font-family:'Space Grotesk';font-size:14px;font-weight:600;flex:0 0 auto;z-index:5;",
              )}
            >
              <span>9:41</span>
              <div style={s('display:flex;gap:7px;align-items:center;')}>
                <Icon name="signal_cellular_alt" size={17} />
                <Icon name="wifi" size={17} />
                <Icon name="battery_full" size={18} />
              </div>
            </div>

            {/* zone des écrans */}
            <div style={s('flex:1;position:relative;overflow:hidden;display:flex;')}>
              {flow === 'welcome' && <Welcome app={app} />}
              {flow === 'login' && <Login app={app} />}
              {flow === 'gym' && <GymPicker app={app} />}
              {flow === 'onboarding' && <Onboarding app={app} />}
              {inApp && state.tab === 'home' && <Home app={app} />}
              {inApp && state.tab === 'workout' && state.workoutView === 'overview' && (
                <WorkoutOverview app={app} />
              )}
              {inApp && state.tab === 'workout' && state.workoutView === 'exercise' && (
                <ExerciseDetail app={app} />
              )}
              {showActive && <ActiveSet app={app} />}
              {inApp && state.tab === 'coach' && <Coach app={app} />}
              {inApp && state.tab === 'profile' && <Profile app={app} />}
            </div>

            {showNav && <BottomNav app={app} />}
          </div>
        </div>
      </div>
    </div>
  );
}
