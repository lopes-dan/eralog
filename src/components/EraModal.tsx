import { useState, useEffect, useRef, FormEvent } from 'react';
import { Search, Music2, Disc, Plus, Star, Trash2, X, Calendar, Flame, Keyboard } from 'lucide-react';
import { Era } from '../lib/supabase';
import { searchBands, MBBand } from '../lib/musicbrainz';
import { searchArtistImage, searchAlbumCover, searchAlbums, searchTracks, DeezerAlbum, DeezerTrack } from '../lib/deezer';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { DatePicker } from './ui/date-picker';
import { cn } from '@/lib/utils';

type SongDraft = {
  title: string;
  track_number: number | null;
  note: string;
  is_favorite: boolean;
};

type AlbumDraft = {
  title: string;
  note: string;
  listened_on: string | null;
  cover_url: string | null;
  songs: SongDraft[];
};

export type EraPayload = Partial<Era> & { albums?: AlbumDraft[] };

type Props = {
  era?: Era | null;
  isSuperFan?: boolean;
  onSave: (data: EraPayload) => Promise<void>;
  onClose: () => void;
};

const LEVEL_LABELS = ['', 'Casual', 'Into It', 'Deep', 'Spiraling', 'Full Collapse'];
const LEVEL_DESCS = ['', 'A passing phase', 'On repeat for weeks', 'Know every lyric', "Can't stop, won't stop", 'Life-altering obsession'];
const FLAME_COLORS = ['', 'text-ink-500', 'text-gold-400', 'text-ember-400', 'text-ember-500', 'text-ember-400'];
const FLAME_ACTIVE_GLOW = ['', '', 'shadow-gold-400/20', 'shadow-ember-400/20', 'shadow-ember-500/30', 'shadow-ember-400/40'];

const NOTE_PLACEHOLDERS = [
  "Found them at 2am and haven't slept since...",
  'Heard this in a coffee shop and stood frozen...',
  'A friend sent me one song. Then another. Then I was gone.',
  'Something about the way they write about loneliness...',
  "Ex introduced me to them. Now they're mine.",
];

function calcDuration(start: string, end: string): string | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86400000);
  if (days < 14) return `${days} days`;
  if (days < 60) return `~${Math.round(days / 7)} weeks`;
  if (days < 365) return `~${Math.round(days / 30)} months`;
  const yrs = (days / 365).toFixed(1);
  return `~${yrs} years`;
}

export default function EraModal({ era, isSuperFan = false, onSave, onClose }: Props) {
  const [bandName, setBandName] = useState(era?.band_name ?? '');
  const [bandMbid, setBandMbid] = useState(era?.band_mbid ?? '');
  const [bandImageUrl, setBandImageUrl] = useState<string | null>(era?.band_image_url ?? null);
  const [bandImageLoading, setBandImageLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>(era?.genres ?? []);
  const [startDate, setStartDate] = useState(era?.start_date ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(era?.end_date ?? '');
  const [obsessionLevel, setObsessionLevel] = useState(era?.obsession_level ?? 3);
  const [note, setNote] = useState(era?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(!!(era?.band_name && !era?.band_mbid));

  const [albumDrafts, setAlbumDrafts] = useState<AlbumDraft[]>([]);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumNote, setAlbumNote] = useState('');
  const [albumDate, setAlbumDate] = useState('');
  const [albumSearchResults, setAlbumSearchResults] = useState<DeezerAlbum[]>([]);
  const [albumSearching, setAlbumSearching] = useState(false);
  const [showAlbumResults, setShowAlbumResults] = useState(false);
  const albumSearchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const albumResultsRef = useRef<HTMLDivElement>(null);

  const [editingAlbumIdx, setEditingAlbumIdx] = useState<number | null>(null);
  const [songTitle, setSongTitle] = useState('');
  const [songNote, setSongNote] = useState('');
  const [songFavorite, setSongFavorite] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MBBand[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [trackResults, setTrackResults] = useState<DeezerTrack[]>([]);
  const [trackSearching, setTrackSearching] = useState(false);
  const [showTrackResults, setShowTrackResults] = useState(false);
  const trackSearchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const trackResultsRef = useRef<HTMLDivElement>(null);

  const [notePlaceholder] = useState(() => NOTE_PLACEHOLDERS[Math.floor(Math.random() * NOTE_PLACEHOLDERS.length)]);
  const duration = calcDuration(startDate, endDate);

  // Track search debounce (scoped to the album being edited)
useEffect(() => {
  clearTimeout(trackSearchTimeout.current);
  if (editingAlbumIdx === null || !songTitle.trim() || !bandName.trim()) {
    setTrackResults([]);
    setShowTrackResults(false);
    return;
  }
  const albumTitleForSearch = albumDrafts[editingAlbumIdx]?.title ?? '';
  setTrackSearching(true);
  trackSearchTimeout.current = setTimeout(async () => {
    const results = await searchTracks(bandName, albumTitleForSearch, songTitle);
    setTrackResults(results);
    setShowTrackResults(results.length > 0);
    setTrackSearching(false);
  }, 400);
  return () => clearTimeout(trackSearchTimeout.current);
}, [songTitle, editingAlbumIdx, bandName, albumDrafts]);

  useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (trackResultsRef.current && !trackResultsRef.current.contains(e.target as Node)) {
      setShowTrackResults(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
  // Band search debounce
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) { setSearchResults([]); setShowResults(false); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchBands(searchQuery);
      setSearchResults(results);
      setShowResults(true);
      setSearching(false);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // Album search debounce
  useEffect(() => {
    clearTimeout(albumSearchTimeout.current);
    if (!albumTitle.trim() || !bandName.trim()) {
      setAlbumSearchResults([]);
      setShowAlbumResults(false);
      return;
    }
    setAlbumSearching(true);
    albumSearchTimeout.current = setTimeout(async () => {
      const results = await searchAlbums(bandName, albumTitle);
      setAlbumSearchResults(results);
      setShowAlbumResults(results.length > 0);
      setAlbumSearching(false);
    }, 400);
    return () => clearTimeout(albumSearchTimeout.current);
  }, [albumTitle, bandName]);

  // Click-outside for band search
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Click-outside for album search
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (albumResultsRef.current && !albumResultsRef.current.contains(e.target as Node)) {
        setShowAlbumResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cmd+Enter submit
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (bandName.trim()) {
          const form = document.getElementById('era-modal-form') as HTMLFormElement;
          form?.requestSubmit();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [bandName]);

  function selectBand(band: MBBand) {
    setBandName(band.name);
    setBandMbid(band.id);
    setGenres(band.genres);
    setSearchQuery('');
    setShowResults(false);
    setBandImageLoading(true);
    setBandImageUrl(null);
    searchArtistImage(band.name).then(url => {
      setBandImageUrl(url);
      setBandImageLoading(false);
    });
  }

  function clearBand() {
    setBandName('');
    setBandMbid('');
    setBandImageUrl(null);
    setGenres([]);
  }

  function selectAlbumResult(album: DeezerAlbum) {
    setAlbumTitle(album.title);
    setShowAlbumResults(false);
    // We'll pass cover_url when actually adding
    // Store it temporarily so addAlbum can use it
    setPendingAlbumCover(album.cover_big ?? null);
  }

  const [pendingAlbumCover, setPendingAlbumCover] = useState<string | null>(null);

  function addAlbum() {
    if (!albumTitle.trim()) return;
    const title = albumTitle.trim();
    const idx = albumDrafts.length;
    const hasCover = !!pendingAlbumCover;
    setAlbumDrafts(prev => [...prev, {
      title,
      note: albumNote,
      listened_on: albumDate || null,
      cover_url: pendingAlbumCover,
      songs: [],
    }]);
    setAlbumTitle('');
    setAlbumNote('');
    setAlbumDate('');
    setPendingAlbumCover(null);
    setShowAlbumForm(false);
    // Only fetch cover via Deezer if we didn't already get one from the search result
    if (!hasCover) {
      searchAlbumCover(bandName, title).then(url => {
        if (url) setAlbumDrafts(prev => prev.map((a, i) => i === idx ? { ...a, cover_url: url } : a));
      });
    }
  }

  function removeAlbum(idx: number) {
    setAlbumDrafts(prev => prev.filter((_, i) => i !== idx));
    if (editingAlbumIdx === idx) setEditingAlbumIdx(null);
  }

  function addSongToAlbum(albumIdx: number) {
    if (!songTitle.trim()) return;
    setAlbumDrafts(prev => prev.map((a, i) =>
      i === albumIdx
        ? { ...a, songs: [...a.songs, { title: songTitle.trim(), track_number: a.songs.length + 1, note: songNote, is_favorite: songFavorite }] }
        : a
    ));
    setSongTitle('');
    setSongNote('');
    setSongFavorite(false);
  }
  function pickTrackForAlbum(albumIdx: number, track: DeezerTrack) {
  setAlbumDrafts(prev => prev.map((a, i) =>
    i === albumIdx
      ? {
          ...a,
          songs: [...a.songs, {
            title: track.title,
            track_number: track.track_position ?? a.songs.length + 1,
            note: songNote,
            is_favorite: songFavorite,
          }],
        }
      : a
  ));
  setSongTitle('');
  setSongNote('');
  setSongFavorite(false);
  setTrackResults([]);
  setShowTrackResults(false);
}

  function removeSongFromAlbum(albumIdx: number, songIdx: number) {
    setAlbumDrafts(prev => prev.map((a, i) =>
      i === albumIdx ? { ...a, songs: a.songs.filter((_, si) => si !== songIdx) } : a
    ));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: EraPayload = {
      band_name: bandName,
      band_mbid: bandMbid || null,
      band_image_url: bandImageUrl,
      genres,
      start_date: startDate,
      end_date: endDate || null,
      obsession_level: obsessionLevel,
      note,
    };
    if (isSuperFan && albumDrafts.length > 0) {
      payload.albums = albumDrafts;
    }
    await onSave(payload);
    setSaving(false);
  }

  const bandSelected = !!bandName;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg p-0 gap-0 max-h-[90vh] overflow-y-auto bg-ink-950 border-ink-800">

        {/* ── Modal header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-ink-800/70">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-ember-500 font-medium mb-0.5">
              {era ? 'Editing' : 'New entry'}
            </p>
            <h2 className="font-display text-xl font-bold text-ink-50 leading-tight">
              {era ? 'Edit Era' : 'Log an Era'}
            </h2>
          
          </div>
        </div>

        <form id="era-modal-form" onSubmit={handleSubmit} className="divide-y divide-ink-800/50">

          {/* ── Band identity block ─────────────────────────────────────── */}
          <div className="px-6 py-5 space-y-4">

            {bandSelected ? (
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {bandImageLoading ? (
                    <div className="w-16 h-16 rounded-xl bg-ink-800 animate-pulse ring-1 ring-ink-700" />
                  ) : bandImageUrl ? (
                    <img
                      src={bandImageUrl}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover ring-1 ring-ink-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-ink-800 flex items-center justify-center ring-1 ring-ink-700">
                      <Music2 className="w-7 h-7 text-ink-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-2xl font-bold text-ink-50 leading-tight truncate">
                      {bandName}
                    </h3>
                    <button
                      type="button"
                      onClick={clearBand}
                      className="shrink-0 mt-1 text-ink-600 hover:text-ink-300 transition-colors"
                      title="Clear selection"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {genres.slice(0, 4).map(g => (
                        <span key={g} className="text-[11px] text-ink-500 bg-ink-800/60 px-2 py-0.5 rounded-full border border-ink-700/50">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                  {showManualEntry && (
                    <Input
                      value={bandName}
                      onChange={e => setBandName(e.target.value)}
                      className="mt-2 h-8 text-sm"
                      placeholder="Edit name..."
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(v => !v)}
                    className="text-[11px] text-ink-600 hover:text-ink-400 transition-colors mt-1.5"
                  >
                    {showManualEntry ? 'Hide edit' : 'Edit name'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-ink-800/60 border border-dashed border-ink-700 flex items-center justify-center shrink-0">
                  <Music2 className="w-7 h-7 text-ink-700" />
                </div>
                <div className="flex-1">
                  <p className="text-ink-300 text-sm font-medium">Who are you obsessed with?</p>
                  <p className="text-ink-600 text-xs mt-0.5">Search below to find them</p>
                </div>
              </div>
            )}

            {!bandSelected && (
              <div className="relative" ref={resultsRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search MusicBrainz..."
                    className="pl-9 pr-9"
                    autoFocus
                  />
                  {searching && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-ink-600/40 border-t-ink-400 rounded-full animate-spin" />
                  )}
                </div>

                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-ink-900 border border-ink-700 rounded-xl shadow-2xl shadow-black/50 z-20 overflow-hidden max-h-52 overflow-y-auto">
                    {searchResults.map(band => (
                      <button
                        key={band.id}
                        type="button"
                        onClick={() => selectBand(band)}
                        className="w-full text-left px-4 py-3 hover:bg-ink-800 transition-colors flex items-start gap-3 border-b border-ink-800/60 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Music2 className="w-4 h-4 text-ink-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-ink-100 text-sm font-medium truncate">{band.name}</p>
                          {band.disambiguation && (
                            <p className="text-ink-500 text-xs truncate">{band.disambiguation}</p>
                          )}
                          {band.genres.length > 0 && (
                            <p className="text-ember-400/80 text-xs mt-0.5 truncate">
                              {band.genres.slice(0, 3).join(' · ')}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(v => !v)}
                    className="text-xs text-ink-600 hover:text-ink-400 transition-colors"
                  >
                    {showManualEntry ? 'Hide manual entry' : "Can't find them? Enter manually"}
                  </button>
                </div>

                {showManualEntry && (
                  <div className="mt-2">
                    <Input
                      value={bandName}
                      onChange={e => setBandName(e.target.value)}
                      placeholder="e.g. Nick Cave & The Bad Seeds"
                      required={!bandSelected}
                    />
                  </div>
                )}
              </div>
            )}

            {!showManualEntry && (
              <input type="hidden" name="band_name" value={bandName} required={!bandName} />
            )}
          </div>

          {/* ── Obsession level ─────────────────────────────────────────── */}
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.15em] text-ink-500 font-medium">Obsession Level</p>
              <span className="text-[11px] text-ink-600 italic">{LEVEL_DESCS[obsessionLevel]}</span>
            </div>

            <div className="text-center py-1">
              <span
                className={cn(
                  'font-display font-black leading-none transition-all duration-300',
                  obsessionLevel <= 2 ? 'text-4xl text-ink-400' :
                  obsessionLevel === 3 ? 'text-4xl text-gold-400' :
                  obsessionLevel === 4 ? 'text-5xl text-ember-400' :
                  'text-5xl text-ember-400 drop-shadow-[0_0_20px_rgba(255,90,0,0.4)]'
                )}
              >
                {LEVEL_LABELS[obsessionLevel]}
              </span>
            </div>

            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setObsessionLevel(lvl)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all duration-200',
                    obsessionLevel === lvl
                      ? 'border-ember-500/50 bg-ember-500/10 shadow-lg ' + FLAME_ACTIVE_GLOW[lvl]
                      : 'border-ink-800 bg-ink-800/40 hover:border-ink-700 hover:bg-ink-800/70'
                  )}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: lvl }).map((_, i) => (
                      <Flame
                        key={i}
                        className={cn(
                          'w-3.5 h-3.5 transition-colors duration-200',
                          obsessionLevel >= lvl ? FLAME_COLORS[lvl] : 'text-ink-700'
                        )}
                        fill={obsessionLevel >= lvl ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium transition-colors duration-200 whitespace-nowrap',
                    obsessionLevel === lvl ? 'text-ink-200' : 'text-ink-600'
                  )}>
                    {LEVEL_LABELS[lvl]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Timeline ────────────────────────────────────────────────── */}
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-ink-500" />
              <p className="text-[10px] uppercase tracking-[0.15em] text-ink-500 font-medium">Timeline</p>
              {duration && (
                <span className="ml-auto text-xs text-ink-500 italic">Spanning {duration}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-300">
                  Start <span className="text-ember-500">*</span>
                </label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Start date"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-500">
                  End <span className="text-ink-700 font-normal">(still going?)</span>
                </label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Still going..."
                />
              </div>
            </div>
          </div>

          {/* ── Journal note ────────────────────────────────────────────── */}
          <div className="px-6 py-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.15em] text-ink-500 font-medium">Your Note</p>
              <span className="text-[11px] text-ink-700">{note.length > 0 ? `${note.length} chars` : 'optional'}</span>
            </div>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={notePlaceholder}
              rows={3}
              className="font-serif resize-none bg-ink-900/80 border-ink-700/60 text-ink-200 placeholder:text-ink-700 placeholder:italic leading-relaxed px-4 py-3 text-[15px] focus:border-ember-600/50"
            />
          </div>

          {/* ── Super Fan: Albums & Songs ────────────────────────────────── */}
          {isSuperFan && (
            <div className="px-6 py-5 space-y-4 bg-gradient-to-b from-gold-500/[0.04] to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Star className="w-4 h-4 text-gold-400 fill-gold-400/80" />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-gold-400 font-medium">Super Fan — Albums & Songs</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gold-500/20 to-transparent" />
              </div>

              {albumDrafts.length > 0 && (
                <div className="space-y-2.5">
                  {albumDrafts.map((album, ai) => (
                    <div
                      key={ai}
                      className="bg-ink-800/50 border border-ink-700/50 rounded-xl overflow-hidden hover:border-ink-600/60 transition-colors"
                    >
                      <div className="flex items-start gap-3 p-3">
                        <div className="shrink-0">
                          {album.cover_url ? (
                            <img
                              src={album.cover_url}
                              alt=""
                              className="w-11 h-11 rounded-lg object-cover ring-1 ring-ink-700"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-ink-700/60 flex items-center justify-center ring-1 ring-ink-700">
                              <Disc className="w-5 h-5 text-ink-500" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-ink-100 text-sm font-semibold truncate">{album.title}</p>
                          {album.listened_on && (
                            <p className="text-ink-600 text-[11px] mt-0.5">{album.listened_on}</p>
                          )}
                          {album.note && (
                            <p className="text-ink-500 text-xs mt-0.5 italic">{album.note}</p>
                          )}

                          {album.songs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {album.songs.map((song, si) => (
                                <span
                                  key={si}
                                  className={cn(
                                    'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-colors',
                                    song.is_favorite
                                      ? 'border-gold-500/30 bg-gold-500/10 text-gold-300'
                                      : 'border-ink-700 bg-ink-800/60 text-ink-400'
                                  )}
                                >
                                  {song.is_favorite && <Star className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />}
                                  {song.title}
                                  <button
                                    type="button"
                                    onClick={() => removeSongFromAlbum(ai, si)}
                                    className="ml-0.5 text-ink-600 hover:text-ember-400 transition-colors"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {editingAlbumIdx === ai ? (
                            <div className="mt-2.5 bg-ink-900/70 rounded-lg p-2.5 space-y-2 border border-ink-700/50">
                            <div className="relative" ref={trackResultsRef}>
  <div className="relative">
    <Input
      value={songTitle}
      onChange={e => setSongTitle(e.target.value)}
      placeholder="Song title"
      className="h-8 text-sm pr-8"
      autoFocus
    />
    {trackSearching && (
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-ink-600/40 border-t-ink-400 rounded-full animate-spin" />
    )}
  </div>

  {showTrackResults && trackResults.length > 0 && (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-ink-900 border border-ink-700 rounded-xl shadow-2xl shadow-black/50 z-30 overflow-hidden max-h-48 overflow-y-auto">
      {trackResults.map(track => (
        <button
          key={track.id}
          type="button"
          onClick={() => pickTrackForAlbum(ai, track)}
          className="w-full text-left px-3 py-2 hover:bg-ink-800 transition-colors flex items-center gap-2.5 border-b border-ink-800/60 last:border-0"
        >
          {track.album.cover_medium ? (
            <img
              src={track.album.cover_medium}
              alt=""
              className="w-7 h-7 rounded object-cover shrink-0 ring-1 ring-ink-700"
              loading="lazy"
            />
          ) : (
            <div className="w-7 h-7 rounded bg-ink-800 flex items-center justify-center shrink-0">
              <Music2 className="w-3.5 h-3.5 text-ink-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-ink-100 text-xs font-medium truncate">{track.title}</p>
            <p className="text-ink-500 text-[11px] truncate">{track.album.title}</p>
          </div>
        </button>
      ))}
    </div>
  )}
</div>
                              <Input
                                value={songNote}
                                onChange={e => setSongNote(e.target.value)}
                                placeholder="Note (optional)"
                                className="h-8 text-sm"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSongFavorite(f => !f)}
                                  className={cn(
                                    'flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border transition-all',
                                    songFavorite
                                      ? 'border-gold-500/40 bg-gold-500/15 text-gold-400'
                                      : 'border-ink-700 text-ink-500 hover:border-ink-600'
                                  )}
                                >
                                  <Star className={cn('w-3 h-3', songFavorite && 'fill-gold-400 text-gold-400')} />
                                  Favorite
                                </button>
                                <div className="flex-1" />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs px-2"
                                  onClick={() => { setEditingAlbumIdx(null); setSongTitle(''); setSongNote(''); setSongFavorite(false); }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 text-xs px-3"
                                  disabled={!songTitle.trim()}
                                  onClick={() => addSongToAlbum(ai)}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setEditingAlbumIdx(ai); setSongTitle(''); setSongNote(''); setSongFavorite(false); }}
                              className="flex items-center gap-1 text-[11px] text-ink-600 hover:text-ember-400 transition-colors mt-2"
                            >
                              <Plus className="w-3 h-3" />
                              Add song
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeAlbum(ai)}
                          className="text-ink-700 hover:text-ember-400 transition-colors mt-0.5 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAlbumForm ? (
                <div className="bg-ink-800/40 border border-ink-700/60 rounded-xl p-4 space-y-2.5">
                  <p className="text-xs font-medium text-ink-400">New album</p>

                  {/* Album title with search dropdown */}
                  <div className="relative" ref={albumResultsRef}>
                    <div className="relative">
                      <Input
                        value={albumTitle}
                        onChange={e => { setAlbumTitle(e.target.value); setPendingAlbumCover(null); }}
                        placeholder="Album title"
                        autoFocus
                        className="pr-8"
                      />
                      {albumSearching && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-ink-600/40 border-t-ink-400 rounded-full animate-spin" />
                      )}
                    </div>

                    {showAlbumResults && albumSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-ink-900 border border-ink-700 rounded-xl shadow-2xl shadow-black/50 z-20 overflow-hidden max-h-52 overflow-y-auto">
                        {albumSearchResults.map(album => (
                          <button
                            key={album.id}
                            type="button"
                            onClick={() => selectAlbumResult(album)}
                            className="w-full text-left px-3 py-2.5 hover:bg-ink-800 transition-colors flex items-center gap-3 border-b border-ink-800/60 last:border-0"
                          >
                            {album.cover_big ? (
                              <img
                                src={album.cover_big}
                                alt=""
                                className="w-9 h-9 rounded-md object-cover shrink-0 ring-1 ring-ink-700"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-md bg-ink-800 flex items-center justify-center shrink-0">
                                <Disc className="w-4 h-4 text-ink-500" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-ink-100 text-sm font-medium truncate">{album.title}</p>
                              <p className="text-ink-500 text-xs truncate">
                                {album.artist.name}
                                {album.release_date && (
                                  <span className="text-ink-700"> · {album.release_date.slice(0, 4)}</span>
                                )}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker
                      value={albumDate}
                      onChange={setAlbumDate}
                      placeholder="Listened on"
                    />
                    <Input
                      value={albumNote}
                      onChange={e => setAlbumNote(e.target.value)}
                      placeholder="Note (optional)"
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end pt-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAlbumForm(false); setAlbumTitle(''); setAlbumNote(''); setAlbumDate(''); setPendingAlbumCover(null); setShowAlbumResults(false); }}>
                      Cancel
                    </Button>
                    <Button type="button" size="sm" disabled={!albumTitle.trim()} onClick={addAlbum}>
                      Add Album
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAlbumForm(true)}
                  className="flex items-center gap-2 text-sm text-gold-400/80 hover:text-gold-300 transition-colors py-1 group"
                >
                  <span className="w-6 h-6 rounded-lg border border-gold-500/20 bg-gold-500/5 group-hover:bg-gold-500/10 flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                  Log an album
                </button>
              )}
            </div>
          )}

          {/* ── Footer / actions ────────────────────────────────────────── */}
          <div className="px-6 py-4 flex items-center gap-3 bg-ink-950/80">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-ink-500 hover:text-ink-300 transition-colors px-2"
            >
              Cancel
            </button>
            <div className="flex-1" />
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-ink-700">
              <Keyboard className="w-3 h-3" />
              <span>⌘ Enter</span>
            </div>
            <Button
              type="submit"
              disabled={saving || !bandName.trim()}
              className="bg-ember-500 hover:bg-ember-400 text-white px-6 py-2 text-sm font-semibold gap-2 min-w-[110px] justify-center"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                era ? 'Save Changes' : 'Log Era'
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
