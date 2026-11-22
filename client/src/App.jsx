import { useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './components/AuthPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import { applyTheme } from './utils.js';

export default function App() {
  const { user, loading } = useAuth();
  const theme = user ? user.theme : 'teal';

  // theme + dark mode change par colors dobara lagao
  useEffect(() => {
    applyTheme(theme);
    const mq = window.matchMedia('(prefers-color-scheme:dark)');
    const h = () => applyTheme(theme);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [theme]);

  if (loading) return <main className="err-page">Loading…</main>;
  return user ? <Dashboard /> : <AuthPage />;
}
