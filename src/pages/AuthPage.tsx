import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ember-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <svg className="w-8 h-8 text-ember-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0C17 8 12 2 12 2zm0 15.5a3 3 0 01-2.83-4c.5-1.5 1.83-3 2.83-4.5 1 1.5 2.33 3 2.83 4.5A3 3 0 0112 17.5z" />
            </svg>
            <h1 className="font-display text-3xl font-bold text-ink-50">Era Log</h1>
          </div>
          <p className="text-ink-400 text-sm">Document your descents. Embrace your spirals.</p>
        </div>

        <Card className="p-8">
          <h2 className="font-display text-xl font-bold text-ink-50 mb-6">
            {mode === 'login' ? 'Welcome back' : 'Start your log'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-ember-400 text-sm bg-ember-500/10 border border-ember-500/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full gap-2 mt-2">
              {loading && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-ink-500 text-sm mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-ember-400 hover:text-ember-300 transition-colors font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}
