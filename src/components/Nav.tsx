import { Clock, BarChart2, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import NavShell from './NavShell';

type Page = 'timeline' | 'stats' | 'settings';

type Props = {
  page: Page;
  onNav: (p: Page) => void;
};

export default function Nav({ page, onNav }: Props) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  return (
    <NavShell>
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
          <svg className="w-5 h-5 text-ember-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0C17 8 12 2 12 2zm0 15.5a3 3 0 01-2.83-4c.5-1.5 1.83-3 2.83-4.5 1 1.5 2.33 3 2.83 4.5A3 3 0 0112 17.5z" />
          </svg>
          <span className="font-display font-bold text-ink-50 text-lg">EraLog</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        <Button
          variant={page === 'timeline' ? 'secondary' : 'ghost'}
          size="sm"
          className="gap-1.5"
          onClick={() => onNav('timeline')}
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Timeline</span>
        </Button>
        <Button
          variant={page === 'stats' ? 'secondary' : 'ghost'}
          size="sm"
          className="gap-1.5"
          onClick={() => onNav('stats')}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Stats</span>
        </Button>
        <Button
          variant={page === 'settings' ? 'secondary' : 'ghost'}
          size="sm"
          className="gap-1.5"
          onClick={() => onNav('settings')}
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 h-8 w-8 text-ink-600 hover:text-ink-400"
          onClick={() => { signOut(); navigate('/'); }}
          title={user?.email}
        >
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </nav>
    </NavShell>
  );
}
