import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  BarChart2,
  Search,
  Star,
  Clock,
  ChevronDown,
  ArrowRight,
  Disc,
  BookOpen,
  Zap,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NavShell from '../components/NavShell';


// ─── Flame logo ──────────────────────────────────────────────────────────────
function FlameLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0C17 8 12 2 12 2zm0 15.5a3 3 0 01-2.83-4c.5-1.5 1.83-3 2.83-4.5 1 1.5 2.33 3 2.83 4.5A3 3 0 0112 17.5z" />
    </svg>
  );
}

// ─── Mock UI preview ─────────────────────────────────────────────────────────
function MockUI() {
  const cards = [
    { band: 'Nick Cave & The Bad Seeds', level: 5, days: 47, genres: ['gothic rock', 'post-punk'], active: true },
    { band: 'Grouper', level: 4, genres: ['drone', 'ambient', 'folk'], active: false },
    { band: 'The National', level: 3, genres: ['indie rock', 'chamber pop'], active: false },
  ];

  const levelColors: Record<number, string> = {
    3: 'text-yellow-400',
    4: 'text-orange-400',
    5: 'text-red-400',
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Glow behind */}
      <div className="absolute -inset-4 bg-ember-500/10 rounded-3xl blur-2xl pointer-events-none" />

      <div className="relative bg-ink-900/90 border border-ink-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* App bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-ink-950 border-b border-ink-800">
          <FlameLogo className="w-4 h-4 text-ember-500" />
          <span className="font-display font-bold text-ink-100 text-sm">EraLog</span>
          <div className="flex-1" />
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-ink-700" />
            <div className="w-2 h-2 rounded-full bg-ink-700" />
            <div className="w-2 h-2 rounded-full bg-ink-700" />
          </div>
        </div>

        {/* Section label */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] uppercase tracking-widest text-ember-500 font-medium">Currently Spiraling</span>
        </div>

        {/* Cards */}
        <div className="px-4 pb-4 space-y-3">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 ${
                card.active
                  ? 'bg-ember-500/10 border-ember-500/30'
                  : 'bg-ink-800/50 border-ink-700/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {card.active && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-ember-400 animate-pulse" />
                      <span className="text-[9px] text-ember-400 uppercase tracking-widest font-medium">Active</span>
                    </div>
                  )}
                  <p className="font-display font-bold text-ink-50 text-sm truncate">{card.band}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {card.genres.slice(0, 2).map(g => (
                      <span key={g} className="text-[9px] bg-ink-700 text-ink-400 px-1.5 py-0.5 rounded-full">{g}</span>
                    ))}
                  </div>
                </div>
                {card.active && card.days && (
                  <div className="text-right ml-2 shrink-0">
                    <p className="font-display font-bold text-ink-50 text-lg leading-none">{card.days}</p>
                    <p className="text-[9px] text-ink-500">days deep</p>
                  </div>
                )}
              </div>
              {/* Flame row */}
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className={`w-3 h-3 ${j < card.level ? levelColors[card.level] ?? 'text-ember-400' : 'text-ink-700'}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0C17 8 12 2 12 2zm0 15.5a3 3 0 01-2.83-4c.5-1.5 1.83-3 2.83-4.5 1 1.5 2.33 3 2.83 4.5A3 3 0 0112 17.5z" />
                  </svg>
                ))}
                <span className={`text-[9px] ml-1 font-medium ${levelColors[card.level] ?? 'text-ink-400'}`}>
                  {['', 'Casual', 'Into It', 'Deep', 'Spiraling', 'Full Collapse'][card.level]}
                </span>
              </div>
              {/* Commentary */}
              {card.active && (
                <p className="text-[10px] text-ink-500 italic mt-1.5">
                  "47 weeks into Nick Cave. You're eating soup alone and loving it."
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Clock,
    title: 'Era Timeline',
    desc: 'Every obsession logged chronologically. See your entire musical history at a glance, from the fleeting phases to the years-long spirals.',
  },
  {
    icon: Flame,
    title: 'Obsession Levels',
    desc: 'Rate each era from Casual to Full Collapse. Five levels. Five flames. Completely honest about what that Nick Cave phase was.',
  },
  {
    icon: Search,
    title: 'MusicBrainz Search',
    desc: 'Search 2 million artists instantly. Auto-fills band info and genre tags so you spend less time typing and more time listening.',
  },
  {
    icon: BarChart2,
    title: 'Stats & Patterns',
    desc: 'Discover your most revisited bands, average era length, and a personality read based on your genre history. Uncomfortably accurate.',
  },
  {
    icon: Disc,
    title: 'Album Logging',
    desc: 'Track the exact records you obsessed over within each era. A full archaeological dig into each rabbit hole.',
  },
  {
    icon: BookOpen,
    title: 'Personal Notes',
    desc: 'Add context to each era. "Found them at 2am and cried." "My ex introduced me to them. Moving on." Your log, your words.',
  },
];

// ─── Steps ───────────────────────────────────────────────────────────────────
const STEPS = [
  {
    n: '01',
    icon: Search,
    title: 'Find the band',
    desc: 'Search MusicBrainz to pull in the artist instantly with genre tags pre-filled.',
  },
  {
    n: '02',
    icon: Flame,
    title: 'Log the era',
    desc: 'Set your start date, pick your obsession level, and add a note about how you got here.',
  },
  {
    n: '03',
    icon: BarChart2,
    title: 'Watch the spiral',
    desc: 'Your timeline builds itself. The stats page roasts you. You keep logging anyway.',
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "I logged my third Radiohead era and the app told me I 'contain multitudes.' It's not wrong.",
    name: 'Maya R.',
    role: 'Shoegaze enjoyer',
    initials: 'MR',
    color: 'bg-teal-700',
  },
  {
    quote: "Finally an app that acknowledges that a music phase isn't a phase — it's a lifestyle event that deserves documentation.",
    name: 'Theo K.',
    role: 'Post-punk archaeologist',
    initials: 'TK',
    color: 'bg-rose-800',
  },
  {
    quote: "The cheeky commentary is frighteningly accurate. 'Two months into The National. You've cancelled plans to feel things properly.' Yes.",
    name: 'Sasha D.',
    role: 'Certified spiral veteran',
    initials: 'SD',
    color: 'bg-amber-700',
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { session, signOut } = useAuth();

  const featuresRef = useRef<HTMLElement>(null);

  function scrollToFeatures() {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">

      {/* ── Sticky Nav ────────────────────────────────────────────────────── */}
      <NavShell className="bg-ink-950/80 border-ink-800/60">
        <div className="flex items-center gap-2">
          <FlameLogo className="w-5 h-5 text-ember-500" />
          <span className="font-display font-bold text-ink-50 text-lg">EraLog</span>
        </div>
        <nav className="flex items-center gap-2">
          <button
            onClick={scrollToFeatures}
            className="hidden sm:block text-ink-400 hover:text-ink-100 text-sm font-medium px-3 py-1.5 transition-colors"
          >
            Features
          </button>
          {session ? (
            <>
              <Link
                to="/app"
                className="bg-ember-500 hover:bg-ember-400 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-200 active:scale-95"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="text-ink-400 hover:text-ink-100 p-1.5 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-ink-300 hover:text-ink-100 text-sm font-medium px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="bg-ember-500 hover:bg-ember-400 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-200 active:scale-95"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </NavShell>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-ember-500/6 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-ember-700/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-ember-500/10 border border-ember-500/20 text-ember-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3 h-3" />
              Your music phases deserve a paper trail
            </div>

            <h1 className="font-display text-5xl sm:text-6xl font-black text-ink-50 leading-[1.05] mb-6">
              Document<br />
              your<br />
              <span className="text-ember-500">spirals.</span>
            </h1>

            <p className="text-ink-400 text-lg leading-relaxed mb-8 max-w-md">
              Era Log is the obsession tracker for people who don't just listen to music — they <em className="text-ink-200 not-italic font-medium">fall into</em> it. Log every band phase, measure your depth, and let the app roast you lovingly for it.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 bg-ember-500 hover:bg-ember-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-ember-500/20"
              >
                Start Your Log — Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center justify-center gap-2 bg-ink-800 hover:bg-ink-700 text-ink-200 font-medium px-6 py-3 rounded-xl transition-all duration-200"
              >
                See How It Works
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <p className="text-ink-600 text-sm mt-5">No credit card. No catch. Just your obsessions, documented.</p>
          </div>

          {/* Mock UI */}
          <div className="flex justify-center lg:justify-end">
            <MockUI />
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section ref={featuresRef} className="bg-ink-900/40 border-y border-ink-800/60 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-ember-500 text-xs uppercase tracking-widest font-medium mb-3">What you get</p>
            <h2 className="font-display text-4xl font-bold text-ink-50">Built for the obsessive listener</h2>
            <p className="text-ink-500 text-base mt-4 max-w-md mx-auto">Every feature exists because someone somewhere was three weeks deep into a band at 2am and needed to document it.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-ink-900 border border-ink-800 rounded-2xl p-6 hover:border-ink-700 hover:bg-ink-800/60 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-ember-500/10 flex items-center justify-center mb-4 group-hover:bg-ember-500/15 transition-colors">
                  <Icon className="w-5 h-5 text-ember-400" />
                </div>
                <h3 className="font-display font-bold text-ink-100 text-lg mb-2">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-ember-500 text-xs uppercase tracking-widest font-medium mb-3">Simple by design</p>
            <h2 className="font-display text-4xl font-bold text-ink-50">Three steps into the spiral</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden sm:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-ink-800" />

            {STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="relative text-center">
                <div className="w-20 h-20 rounded-2xl bg-ink-900 border border-ink-800 flex flex-col items-center justify-center mx-auto mb-5 relative z-10">
                  <span className="font-mono text-xs text-ink-600 mb-1">{n}</span>
                  <Icon className="w-6 h-6 text-ember-400" />
                </div>
                <h3 className="font-display font-bold text-ink-100 text-xl mb-2">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="bg-ink-900/40 border-y border-ink-800/60 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-ember-500 text-xs uppercase tracking-widest font-medium mb-3">From the logs</p>
            <h2 className="font-display text-4xl font-bold text-ink-50">Real spirals. Real people.</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, initials, color }) => (
              <div key={name} className="bg-ink-900 border border-ink-800 rounded-2xl p-6 flex flex-col gap-5">
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                  ))}
                </div>
                <p className="text-ink-300 text-sm leading-relaxed italic flex-1">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
                    <span className="text-xs font-semibold text-white">{initials}</span>
                  </div>
                  <div>
                    <p className="text-ink-100 text-sm font-medium">{name}</p>
                    <p className="text-ink-600 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-ember-500 text-xs uppercase tracking-widest font-medium mb-3">Simple pricing</p>
            <h2 className="font-display text-4xl font-bold text-ink-50">Free to spiral. Pay to go deeper.</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-ink-900 border border-ink-800 rounded-2xl p-8">
              <p className="text-ink-400 text-sm font-medium uppercase tracking-widest mb-4">Free</p>
              <div className="mb-6">
                <span className="font-display text-5xl font-black text-ink-50">$0</span>
                <span className="text-ink-600 text-sm ml-2">forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited era logging',
                  'MusicBrainz band search',
                  'Obsession level tracking',
                  'Full stats & personality read',
                  'Cheeky auto-commentary',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-300">
                    <div className="w-4 h-4 rounded-full bg-ink-700 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-ink-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className="block text-center bg-ink-800 hover:bg-ink-700 text-ink-200 font-medium px-5 py-2.5 rounded-xl transition-all duration-200"
              >
                Start Free
              </Link>
            </div>

            {/* Super Fan */}
            <div className="bg-gradient-to-br from-gold-500/10 via-ink-900 to-ink-900 border border-gold-500/30 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-gold-400" />
                Super Fan
              </div>
              <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-4">Pro</p>
              <div className="mb-6">
                <span className="font-display text-5xl font-black text-ink-50">$4</span>
                <span className="text-ink-600 text-sm ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'Album logging per era',
                  'Shareable Era Card image',
                  'Super Fan badge',
                  'Less than one overpriced latte',
                ].map((f, i) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-300">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${i === 0 ? 'bg-ink-700' : 'bg-gold-500/20'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-ink-400' : 'bg-gold-400'}`} />
                    </div>
                    <span className={i > 0 ? 'text-ink-200' : ''}>{f}</span>
                  </li>
                ))}
              </ul>
               {session ? (
    <Link
      to="/app?page=superfan"
      className="block text-center bg-ember-500 hover:bg-ember-400 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-ember-500/20"
    >
      Go to Super Fan
    </Link>
  ) : (
    <Link
      to="/auth"
      className="block text-center bg-ember-500 hover:bg-ember-400 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-ember-500/20"
    >
      Get Super Fan
    </Link>
  )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-80 bg-ember-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <FlameLogo className="w-12 h-12 text-ember-500 mx-auto mb-6" />
          <h2 className="font-display text-5xl font-black text-ink-50 mb-6 leading-tight">
            Your obsessions<br />deserve a record.
          </h2>
          <p className="text-ink-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Start logging today. It's free, it's honest, and it will tell you more about yourself than you asked for.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-ember-500 hover:bg-ember-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 active:scale-95 text-lg shadow-xl shadow-ember-500/25"
          >
            Start Your Log — Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-ink-700 text-sm mt-5">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-ink-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <FlameLogo className="w-4 h-4 text-ember-500" />
            <span className="font-display font-bold text-ink-300">EraLog</span>
            <span className="text-ink-700 text-sm ml-2 hidden sm:inline">— Document your descents.</span>
          </div>
          <nav className="flex items-center gap-6 text-ink-600 text-sm">
            <button onClick={scrollToFeatures} className="hover:text-ink-400 transition-colors">Features</button>
            {session ? (
              <Link to="/app" className="hover:text-ink-400 transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link to="/auth" className="hover:text-ink-400 transition-colors">Sign In</Link>
                <Link to="/auth" className="hover:text-ink-400 transition-colors">Get Started</Link>
              </>
            )}
          </nav>
          <p className="text-ink-800 text-xs">© {new Date().getFullYear()} EraLog</p>
        </div>
      </footer>

    </div>
  );
}
