import { useEffect, useState } from 'react';
import { TrendingUp, Clock, Flame, Brain } from 'lucide-react';
import { supabase, Era } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ObsessionIndicator from '../components/ObsessionIndicator';
import { generatePersonalityRead } from '../lib/commentary';
import { Card, CardContent } from '../components/ui/card';

type BandCount = { band_name: string; count: number; maxLevel: number };

export default function StatsPage() {
  const { user } = useAuth();
  const [eras, setEras] = useState<Era[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('eras').select('*').eq('user_id', user.id).then(({ data }) => {
      if (data) setEras(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-ink-700 border-t-ember-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (eras.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-ink-500 text-lg font-display">No eras yet. Nothing to analyze. Log some obsessions first.</p>
      </div>
    );
  }

  const bandMap: Record<string, BandCount> = {};
  for (const era of eras) {
    if (!bandMap[era.band_name]) bandMap[era.band_name] = { band_name: era.band_name, count: 0, maxLevel: 0 };
    bandMap[era.band_name].count++;
    bandMap[era.band_name].maxLevel = Math.max(bandMap[era.band_name].maxLevel, era.obsession_level);
  }
  const revisited = Object.values(bandMap).filter(b => b.count > 1).sort((a, b) => b.count - a.count).slice(0, 5);

  const endedEras = eras.filter(e => e.end_date);
  const avgDays = endedEras.length
    ? Math.round(endedEras.reduce((sum, e) => {
        const ms = new Date(e.end_date!).getTime() - new Date(e.start_date).getTime();
        return sum + ms / (24 * 60 * 60 * 1000);
      }, 0) / endedEras.length)
    : null;

  const deepest = [...eras].sort((a, b) => b.obsession_level - a.obsession_level || new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0];

  const personalityRead = generatePersonalityRead(eras.map(e => ({ genres: e.genres, band_name: e.band_name, obsession_level: e.obsession_level })));

  const genreCounts: Record<string, number> = {};
  for (const era of eras) for (const g of era.genres) genreCounts[g] = (genreCounts[g] || 0) + 1;
  const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const totalActive = eras.filter(e => !e.end_date).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-in fade-in-0 duration-500">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-50">Your Stats</h1>
        <p className="text-ink-500 text-sm mt-0.5">A clinical assessment of your listening habits</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-ink-50">{eras.length}</p>
          <p className="text-ink-500 text-xs mt-1">Total Eras</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-ember-400">{totalActive}</p>
          <p className="text-ink-500 text-xs mt-1">Active Now</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-ink-50">{avgDays ?? '—'}</p>
          <p className="text-ink-500 text-xs mt-1">Avg Era (days)</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-gold-400">{Object.keys(bandMap).length}</p>
          <p className="text-ink-500 text-xs mt-1">Unique Bands</p>
        </Card>
      </div>

      {/* Deepest spiral */}
      {deepest && (
        <Card className="border-ember-500/30 bg-gradient-to-br from-ember-500/10 to-ink-900">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-ember-500/20 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-ember-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ember-500 font-medium mb-1">Deepest Spiral</p>
                <h3 className="font-display text-2xl font-bold text-ink-50">{deepest.band_name}</h3>
                <div className="mt-1"><ObsessionIndicator level={deepest.obsession_level} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personality read */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 font-medium mb-2">Personality Read</p>
              <p className="text-ink-200 text-base leading-relaxed font-display italic">"{personalityRead}"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revisited bands */}
      {revisited.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-ink-500" />
              <h2 className="text-xs uppercase tracking-widest text-ink-500 font-medium">Return Visits</h2>
            </div>
            <div className="space-y-3">
              {revisited.map(b => (
                <div key={b.band_name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-ink-100 font-medium">{b.band_name}</p>
                    <p className="text-ink-600 text-xs">you've had {b.count} eras with them</p>
                  </div>
                  <ObsessionIndicator level={b.maxLevel} size="sm" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top genres */}
      {topGenres.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-ink-500" />
              <h2 className="text-xs uppercase tracking-widest text-ink-500 font-medium">Genre Breakdown</h2>
            </div>
            <div className="space-y-2">
              {topGenres.map(([genre, count]) => {
                const pct = Math.round((count / topGenres[0][1]) * 100);
                return (
                  <div key={genre} className="flex items-center gap-3">
                    <p className="text-ink-300 text-sm w-32 shrink-0 truncate capitalize">{genre}</p>
                    <div className="flex-1 h-1.5 bg-ink-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ember-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-ink-600 text-xs w-4 text-right">{count}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
