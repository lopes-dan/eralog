import { useState, useEffect, FormEvent } from 'react';
import { Star, CreditCard, Mail, ExternalLink, Check, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

type Notice = { type: 'success' | 'error'; message: string };

function Notice({ notice }: { notice: Notice }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm border ${
      notice.type === 'success'
        ? 'bg-green-500/10 border-green-500/30 text-green-300'
        : 'bg-ember-500/10 border-ember-500/30 text-ember-300'
    }`}>
      {notice.type === 'success'
        ? <Check className="w-4 h-4 mt-0.5 shrink-0" />
        : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
      {notice.message}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-600 mb-3">
      {children}
    </h2>
  );
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();

  // Subscription notice from redirect
  const [subNotice, setSubNotice] = useState<Notice | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgrade') === 'success') {
      refreshProfile();
      setSubNotice({ type: 'success', message: "You're now a Super Fan! Album logging is unlocked." });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('upgrade') === 'cancelled') {
      setSubNotice({ type: 'error', message: 'Upgrade cancelled. You can try again any time.' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Subscription actions
  const [subLoading, setSubLoading] = useState(false);

  async function handleUpgrade() {
    setSubLoading(true);
    setSubNotice(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ return_url: `${window.location.origin}/app?page=settings` }),
        }
      );
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setSubNotice({ type: 'error', message: data.error ?? 'Something went wrong. Please try again.' });
    } catch {
      setSubNotice({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setSubLoading(false);
    }
  }

  async function handleManageBilling() {
    setSubLoading(true);
    setSubNotice(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ return_url: `${window.location.origin}/app?page=settings` }),
        }
      );
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setSubNotice({ type: 'error', message: data.error ?? 'Something went wrong. Please try again.' });
    } catch {
      setSubNotice({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setSubLoading(false);
    }
  }

  // Email update
  const [email, setEmail] = useState(user?.email ?? '');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailNotice, setEmailNotice] = useState<Notice | null>(null);

  async function handleEmailUpdate(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || email === user?.email) return;
    setEmailLoading(true);
    setEmailNotice(null);
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      setEmailNotice({ type: 'error', message: error.message });
    } else {
      setEmailNotice({ type: 'success', message: 'Confirmation sent to your new address. Check your inbox.' });
    }
    setEmailLoading(false);
  }

  const isSuperFan = profile?.is_super_fan ?? false;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-in fade-in-0 duration-500">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-50 leading-tight">Settings</h1>
        <p className="text-ink-500 text-sm mt-1">{user?.email}</p>
      </div>

      <div className="grid gap-6 max-w-xl">

        {/* ── Subscription ─────────────────────────────────────────────── */}
        <section>
          <SectionHeading>Subscription</SectionHeading>
          <Card>
            <CardContent className="p-5 space-y-4">

              {/* Status row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSuperFan ? 'bg-gold-500/10' : 'bg-ink-800'
                  }`}>
                    <Star className={`w-4 h-4 ${isSuperFan ? 'text-gold-400 fill-gold-400' : 'text-ink-500'}`} />
                  </div>
                  <div>
                    <p className="text-ink-100 font-medium text-sm leading-tight">
                      {isSuperFan ? 'Super Fan' : 'Free plan'}
                    </p>
                    <p className="text-ink-500 text-xs mt-0.5">
                      {isSuperFan
                        ? 'Album logging and Era Cards unlocked'
                        : 'Era tracking only'}
                    </p>
                  </div>
                </div>
                {isSuperFan && (
                  <Badge variant="gold" className="gap-1 shrink-0">
                    <Check className="w-2.5 h-2.5" />
                    Active
                  </Badge>
                )}
              </div>

              {subNotice && <Notice notice={subNotice} />}

              {isSuperFan ? (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleManageBilling}
                  disabled={subLoading}
                >
                  {subLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ExternalLink className="w-4 h-4" />}
                  {subLoading ? 'Opening portal...' : 'Manage billing'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg bg-ink-800/60 p-4 space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-2xl font-bold text-ink-50">$4</span>
                      <span className="text-ink-500 text-sm">/month</span>
                    </div>
                    <ul className="space-y-1.5">
                      {[
                        'Log albums within each era',
                        'Track songs and favorites',
                        'Super Fan badge',
                      ].map(f => (
                        <li key={f} className="flex items-center gap-2 text-ink-300 text-xs">
                          <Check className="w-3 h-3 text-green-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    onClick={handleUpgrade}
                    disabled={subLoading}
                    className="w-full gap-2"
                  >
                    {subLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Star className="w-4 h-4 fill-white" />}
                    {subLoading ? 'Redirecting to checkout...' : 'Upgrade to Super Fan'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── Account ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeading>Account</SectionHeading>
          <Card>
            <CardContent className="p-5">
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-ink-500" />
                  <span className="text-ink-200 text-sm font-medium">Email address</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="sr-only">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                {emailNotice && <Notice notice={emailNotice} />}
                <Button
                  type="submit"
                  variant="outline"
                  className="gap-2"
                  disabled={emailLoading || !email.trim() || email === user?.email}
                >
                  {emailLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ShieldCheck className="w-4 h-4" />}
                  {emailLoading ? 'Saving...' : 'Update email'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}
