import { useEffect, useRef } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Home } from './screens/Home';
import { WorkoutDetail } from './screens/WorkoutDetail';
import { WorkoutEditor } from './screens/WorkoutEditor';
import { Session } from './screens/Session';
import { Profile } from './screens/Profile';
import { useStore } from './store/store';

/**
 * Opening the app with a session in progress drops you straight back into it
 * (README §6). Runs once, and only from the home route, so navigating home on
 * purpose mid-session is still possible.
 */
function ResumeActiveSession() {
  const { active } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (active && location.pathname === '/') {
      navigate(`/sessao/${active.id}`, { replace: true });
    }
  }, [active, location.pathname, navigate]);

  return null;
}

export function App() {
  return (
    <>
      <ResumeActiveSession />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/treino/:id" element={<WorkoutDetail />} />
        <Route path="/treino/:id/editar" element={<WorkoutEditor mode="edit" />} />
        <Route path="/novo" element={<WorkoutEditor mode="create" />} />
        <Route path="/sessao/:id" element={<Session />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
