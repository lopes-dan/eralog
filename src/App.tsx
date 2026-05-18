import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import TimelinePage from './pages/TimelinePage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import Nav from './components/Nav';

type Page = 'timeline' | 'stats' | 'settings';

function AppShell() {
  const { session, loading } = useAuth();
  const initialPage = (): Page => {
    const p = new URLSearchParams(window.location.search).get('page');
    return (p === 'settings' || p === 'stats') ? p : 'timeline';
  };
  const [page, setPage] = useState<Page>(initialPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-700 border-t-ember-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-ink-950">
      <Nav page={page} onNav={setPage} />
      <main>
        {page === 'timeline' && <TimelinePage />}
        {page === 'stats' && <StatsPage />}
        {page === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

function AuthShell() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-700 border-t-ember-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (session) return <Navigate to="/app" replace />;
  return <AuthPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthShell />} />
          <Route path="/app" element={<AppShell />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
