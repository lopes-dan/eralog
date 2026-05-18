import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Search, X, LayoutList, LayoutGrid, ChevronLeft, ChevronRight, Music2, Flame } from 'lucide-react';
import { supabase, Era, Album, Song } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EraCard from '../components/EraCard';
import EraModal, { EraPayload } from '../components/EraModal';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;
const STORAGE_KEY = 'era-log-view-mode';

type ViewMode = 'list' | 'grid';

function sortEras(eras: Era[]): Era[] {
  return [...eras].sort((a, b) => {
    const aActive = !a.end_date ? 0 : 1;
    const bActive = !b.end_date ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    const dateDiff = new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function matchesSearch(era: Era, q: string): boolean {
  const lower = q.toLowerCase();
  if (era.band_name.toLowerCase().includes(lower)) return true;
  if (era.note?.toLowerCase().includes(lower)) return true;
  if (era.genres?.some(g => g.toLowerCase().includes(lower))) return true;
  return false;
}

const FLAME_COLORS: Record<number, string> = {
  1: 'text-ink-500', 2: 'text-gold-400', 3: 'text-ember-400',
  4: 'text-ember-500', 5: 'text-ember-400',
};

function GridCard({ era, onClick }: { era: Era; onClick: () => void }) {
  const isActive = !era.end_date;
  const days = Math.floor((Date.now() - new Date(era.start_date).getTime()) / 86400000);
  const flameColor = FLAME_COLORS[era.obsession_level];

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-xl overflow-hidden border transition-all duration-300',
        'hover:border-ink-600 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1',
        isActive ? 'bg-ink-900/80 border-ember-900/40' : 'bg-ink-900/60 border-ink-800/60',
      )}
    >
      <div className="relative aspect-square">
        {era.band_image_url ? (
          <img
            src={era.band_image_url}
            alt={era.band_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center',
            isActive ? 'bg-gradient-to-br from-ember-950/60 to-ink-900' : 'bg-ink-800/60',
          )}>
            <Music2 className="w-10 h-10 text-ink-600 opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
        {isActive && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-70" />
              <span className="relative rounded-full bg-green-400 w-1.5 h-1.5" />
            </span>
          </div>
        )}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="text-[10px] font-semibold text-ink-300 bg-ink-950/70 backdrop-blur-sm rounded px-1.5 py-0.5">
            {days}d
          </span>
        </div>
      </div>

      <div className="p-3">
        <p className="font-display font-bold text-ink-50 text-sm leading-tight truncate mb-1.5">
          {era.band_name}
        </p>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Flame
              key={i}
              className={cn('w-3 h-3', i < era.obsession_level ? flameColor : 'text-ink-800')}
              fill={i < era.obsession_level ? 'currentColor' : 'none'}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

export default function TimelinePage() {
  const { user, profile } = useAuth();
  const isSuperFan = profile?.is_super_fan ?? false;

  const [allEras, setAllEras] = useState<Era[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showEraModal, setShowEraModal] = useState(false);
  const [editingEra, setEditingEra] = useState<Era | null>(null);
  const [gridDetailEra, setGridDetailEra] = useState<Era | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'grid' ? 'grid' : 'list';
  });

  const [page, setPage] = useState(1);

  const loadEras = useCallback(async (pageNum: number, query: string) => {
    if (!user) return;
    setLoading(true);

    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let q = supabase
      .from('eras')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('end_date', { ascending: true, nullsFirst: true })
      .order('start_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (query) {
      q = supabase
        .from('eras')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('end_date', { ascending: true, nullsFirst: true })
        .order('start_date', { ascending: false })
        .order('created_at', { ascending: false });
    }

    const { data, count } = await q;

    if (data) {
      if (query) {
        const filtered = data.filter(e => matchesSearch(e, query));
        const pageStart = (pageNum - 1) * PAGE_SIZE;
        setAllEras(filtered.slice(pageStart, pageStart + PAGE_SIZE));
        setTotalCount(filtered.length);
      } else {
        setAllEras(sortEras(data));
        setTotalCount(count ?? 0);
      }
    }

    setLoading(false);
  }, [user]);

  const loadAlbumsAndSongs = useCallback(async () => {
    if (!user) return;
    const { data: albumsData } = await supabase
      .from('albums').select('*').eq('user_id', user.id).order('listened_on', { ascending: true });
    if (albumsData) setAlbums(albumsData);

    if (isSuperFan) {
      const { data: songsData } = await supabase
        .from('songs').select('*').eq('user_id', user.id).order('track_number', { ascending: true });
      if (songsData) setSongs(songsData);
    }
  }, [user, isSuperFan]);

  useEffect(() => {
    loadEras(page, searchQuery);
  }, [loadEras, page, searchQuery]);

  useEffect(() => {
    loadAlbumsAndSongs();
  }, [loadAlbumsAndSongs]);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearchQuery(value);
      setPage(1);
    }, 250);
  }

  function clearSearch() {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  }

  function toggleViewMode(mode: ViewMode) {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }

async function handleSaveEra(data: EraPayload) {
  if (!user) return;
  const { albums: albumDrafts, ...eraData } = data;

  let eraId: string;
  if (editingEra) {
    await supabase.from('eras').update(eraData).eq('id', editingEra.id);
    eraId = editingEra.id;
  } else {
    const { data: inserted } = await supabase
      .from('eras').insert({ ...eraData, user_id: user.id }).select('id').single();
    if (!inserted) return;
    eraId = inserted.id;
  }

  if (albumDrafts && albumDrafts.length > 0) {
    for (const albumDraft of albumDrafts) {
      const { data: albumInserted } = await supabase
        .from('albums')
        .insert({
          era_id: eraId,
          user_id: user.id,
          title: albumDraft.title,
          note: albumDraft.note,
          cover_url: albumDraft.cover_url,
          listened_on: albumDraft.listened_on,
        })
        .select('id').single();

      if (albumInserted && albumDraft.songs.length > 0) {
        await supabase.from('songs').insert(
          albumDraft.songs.map(s => ({
            album_id: albumInserted.id,
            user_id: user.id,
            title: s.title,
            track_number: s.track_number,
            note: s.note,
            is_favorite: s.is_favorite,
          }))
        );
      }
    }
  }

  setShowEraModal(false);
  setEditingEra(null);
  await loadEras(page, searchQuery);
  await loadAlbumsAndSongs();
}

  async function handleDeleteAlbum(albumId: string) {
    await supabase.from('songs').delete().eq('album_id', albumId);
    await supabase.from('albums').delete().eq('id', albumId);
    await loadAlbumsAndSongs();
  }

  async function handleDeleteEra(era: Era) {
    if (!confirm(`Delete your ${era.band_name} era? This can't be undone.`)) return;
    await supabase.from('eras').delete().eq('id', era.id);
    await loadEras(page, searchQuery);
  }

  async function handleMarkEnded(era: Era) {
    await supabase.from('eras').update({ end_date: new Date().toISOString().slice(0, 10) }).eq('id', era.id);
    await loadEras(page, searchQuery);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const showPagination = totalCount > PAGE_SIZE;

  const eraAlbums = (era: Era) => albums.filter(a => a.era_id === era.id);
  const eraAlbumIds = (era: Era) => eraAlbums(era).map(a => a.id);
  const eraSongs = (era: Era) => songs.filter(s => eraAlbumIds(era).includes(s.album_id));

  const activeEras = allEras.filter(e => !e.end_date);
  const endedEras = allEras.filter(e => e.end_date);

  if (loading && allEras.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-ink-700 border-t-ember-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-50 leading-tight">Your Eras</h1>
        <p className="text-ink-500 text-sm mt-1">
          {totalCount > 0
            ? `${totalCount} obsession${totalCount !== 1 ? 's' : ''} logged`
            : 'A diary of musical rabbit holes'}
        </p>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by band, genre, or note..."
            className={cn(
              'h-11 w-full bg-ink-900/60 border border-ink-800/80 rounded-xl pl-10 pr-10 text-sm',
              'text-ink-100 placeholder-ink-600',
              'focus:outline-none focus:border-ink-600 focus:bg-ink-900/80 transition-all',
            )}
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center h-11 bg-ink-900/60 border border-ink-800/80 rounded-xl px-1 gap-0.5">
            <button
              onClick={() => toggleViewMode('list')}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg text-xs font-medium transition-all',
                viewMode === 'list'
                  ? 'bg-ink-700/80 text-ink-100 shadow-sm'
                  : 'text-ink-500 hover:text-ink-300',
              )}
              title="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleViewMode('grid')}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg text-xs font-medium transition-all',
                viewMode === 'grid'
                  ? 'bg-ink-700/80 text-ink-100 shadow-sm'
                  : 'text-ink-500 hover:text-ink-300',
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={() => { setEditingEra(null); setShowEraModal(true); }}
            size="default"
            className="gap-2 whitespace-nowrap h-11 px-5 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Log Era
          </Button>
        </div>
      </div>

      {/* ── Search result count ──────────────────────────────────────── */}
      {searchQuery && (
        <p className="text-ink-500 text-sm mb-5">
          <span className="text-ink-200 font-medium">{totalCount}</span>{' '}
          era{totalCount !== 1 ? 's' : ''} matching{' '}
          <span className="text-ink-300">"{searchQuery}"</span>
        </p>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {!loading && allEras.length === 0 && (
        <div className="text-center py-20 animate-in fade-in-0 duration-500">
          {searchQuery ? (
            <>
              <div className="w-14 h-14 rounded-full bg-ink-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-ink-600" />
              </div>
              <h3 className="font-display text-xl text-ink-300 mb-2">No results</h3>
              <p className="text-ink-600 text-sm">No eras match "{searchQuery}".</p>
              <button onClick={clearSearch} className="mt-4 text-sm text-ember-400 hover:text-ember-300 transition-colors">
                Clear search
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-ink-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-ink-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0C17 8 12 2 12 2zm0 15.5a3 3 0 01-2.83-4c.5-1.5 1.83-3 2.83-4.5 1 1.5 2.33 3 2.83 4.5A3 3 0 0112 17.5z" />
                </svg>
              </div>
              <h3 className="font-display text-xl text-ink-300 mb-2">No eras yet</h3>
              <p className="text-ink-600 text-sm max-w-xs mx-auto">You've fallen down no rabbit holes. That seems unlikely. Log your first obsession.</p>
              <Button onClick={() => setShowEraModal(true)} className="mt-6 gap-2">
                <Plus className="w-4 h-4" />
                Log Your First Era
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── List view ────────────────────────────────────────────────── */}
      {viewMode === 'list' && allEras.length > 0 && (
        <>
          {activeEras.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ember-500">
                  Currently Spiraling
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-ember-500/20 to-transparent" />
                <span className="text-[10px] font-medium text-ink-600 tabular-nums">{activeEras.length}</span>
              </div>
              <div className="space-y-4">
                {activeEras.map(era => (
                  <div key={era.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <EraCard
                      era={era}
                      albums={eraAlbums(era)}
                      songs={eraSongs(era)}
                      isSuperFan={isSuperFan}
                      onEdit={() => { setEditingEra(era); setShowEraModal(true); }}
                      onDelete={() => handleDeleteEra(era)}
                      onMarkEnded={() => handleMarkEnded(era)}
                      onDeleteAlbum={handleDeleteAlbum}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {endedEras.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-600">
                  Past Eras
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-ink-700/40 to-transparent" />
                <span className="text-[10px] font-medium text-ink-600 tabular-nums">{endedEras.length}</span>
              </div>
              <div className="space-y-4">
                {endedEras.map(era => (
                  <div key={era.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <EraCard
                      era={era}
                      albums={eraAlbums(era)}
                      songs={eraSongs(era)}
                      isSuperFan={isSuperFan}
                      onEdit={() => { setEditingEra(era); setShowEraModal(true); }}
                      onDelete={() => handleDeleteEra(era)}
                      onMarkEnded={() => handleMarkEnded(era)}
                      onDeleteAlbum={handleDeleteAlbum}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Grid view ────────────────────────────────────────────────── */}
      {viewMode === 'grid' && allEras.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in-0 duration-300">
          {allEras.map(era => (
            <GridCard
              key={era.id}
              era={era}
              onClick={() => setGridDetailEra(era)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {showPagination && !loading && allEras.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={cn(
              'flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
              page === 1
                ? 'text-ink-700 cursor-not-allowed'
                : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800/60',
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <span className="text-ink-500 text-sm px-3">
            Page <span className="text-ink-200 font-medium tabular-nums">{page}</span> of{' '}
            <span className="text-ink-200 font-medium tabular-nums">{totalPages}</span>
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={cn(
              'flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
              page === totalPages
                ? 'text-ink-700 cursor-not-allowed'
                : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800/60',
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Grid detail modal ─────────────────────────────────────────── */}
      <Dialog open={!!gridDetailEra} onOpenChange={open => { if (!open) setGridDetailEra(null); }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-transparent border-0 shadow-none [&>button]:hidden">
          {gridDetailEra && (
            <div className="max-h-[90vh] overflow-y-auto">
              <EraCard
                era={gridDetailEra}
                albums={eraAlbums(gridDetailEra)}
                songs={eraSongs(gridDetailEra)}
                isSuperFan={isSuperFan}
                onEdit={() => { setEditingEra(gridDetailEra); setGridDetailEra(null); setShowEraModal(true); }}
                onDelete={() => { handleDeleteEra(gridDetailEra); setGridDetailEra(null); }}
                onMarkEnded={() => { handleMarkEnded(gridDetailEra); setGridDetailEra(null); }}
                onDeleteAlbum={handleDeleteAlbum}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Era modal ───────────────────────────────────────────────── */}
      {showEraModal && (
        <EraModal
          era={editingEra}
          isSuperFan={isSuperFan}
          onSave={handleSaveEra}
          onClose={() => { setShowEraModal(false); setEditingEra(null); }}
        />
      )}
    </div>
  );
}

// import { useState, useEffect, useRef, useCallback } from 'react';
// import { Plus, Search, X, LayoutList, LayoutGrid, ChevronLeft, ChevronRight, Music2, Flame } from 'lucide-react';
// import { supabase, Era, Album, Song } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext';
// import EraCard from '../components/EraCard';
// import EraModal, { EraPayload } from '../components/EraModal';
// import { Button } from '../components/ui/button';
// import { Dialog, DialogContent } from '../components/ui/dialog';
// import { cn } from '@/lib/utils';

// const PAGE_SIZE = 12;
// const STORAGE_KEY = 'era-log-view-mode';

// type ViewMode = 'list' | 'grid';

// function sortEras(eras: Era[]): Era[] {
//   return [...eras].sort((a, b) => {
//     const aActive = !a.end_date ? 0 : 1;
//     const bActive = !b.end_date ? 0 : 1;
//     if (aActive !== bActive) return aActive - bActive;
//     const dateDiff = new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
//     if (dateDiff !== 0) return dateDiff;
//     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
//   });
// }

// function matchesSearch(era: Era, q: string): boolean {
//   const lower = q.toLowerCase();
//   if (era.band_name.toLowerCase().includes(lower)) return true;
//   if (era.note?.toLowerCase().includes(lower)) return true;
//   if (era.genres?.some(g => g.toLowerCase().includes(lower))) return true;
//   return false;
// }

// const FLAME_COLORS: Record<number, string> = {
//   1: 'text-ink-500', 2: 'text-gold-400', 3: 'text-ember-400',
//   4: 'text-ember-500', 5: 'text-ember-400',
// };

// function GridCard({ era, onClick }: { era: Era; onClick: () => void }) {
//   const isActive = !era.end_date;
//   const days = Math.floor((Date.now() - new Date(era.start_date).getTime()) / 86400000);
//   const flameColor = FLAME_COLORS[era.obsession_level];

//   return (
//     <button
//       onClick={onClick}
//       className={cn(
//         'group w-full text-left rounded-xl overflow-hidden border transition-all duration-300',
//         'hover:border-ink-600 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1',
//         isActive ? 'bg-ink-900/80 border-ember-900/40' : 'bg-ink-900/60 border-ink-800/60',
//       )}
//     >
//       <div className="relative aspect-square">
//         {era.band_image_url ? (
//           <img
//             src={era.band_image_url}
//             alt={era.band_name}
//             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//             loading="lazy"
//           />
//         ) : (
//           <div className={cn(
//             'w-full h-full flex items-center justify-center',
//             isActive ? 'bg-gradient-to-br from-ember-950/60 to-ink-900' : 'bg-ink-800/60',
//           )}>
//             <Music2 className="w-10 h-10 text-ink-600 opacity-40" />
//           </div>
//         )}
//         <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
//         {isActive && (
//           <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
//             <span className="relative flex w-1.5 h-1.5">
//               <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-70" />
//               <span className="relative rounded-full bg-green-400 w-1.5 h-1.5" />
//             </span>
//           </div>
//         )}
//         <div className="absolute bottom-2.5 right-2.5">
//           <span className="text-[10px] font-semibold text-ink-300 bg-ink-950/70 backdrop-blur-sm rounded px-1.5 py-0.5">
//             {days}d
//           </span>
//         </div>
//       </div>

//       <div className="p-3">
//         <p className="font-display font-bold text-ink-50 text-sm leading-tight truncate mb-1.5">
//           {era.band_name}
//         </p>
//         <div className="flex gap-0.5">
//           {Array.from({ length: 5 }).map((_, i) => (
//             <Flame
//               key={i}
//               className={cn('w-3 h-3', i < era.obsession_level ? flameColor : 'text-ink-800')}
//               fill={i < era.obsession_level ? 'currentColor' : 'none'}
//             />
//           ))}
//         </div>
//       </div>
//     </button>
//   );
// }

// export default function TimelinePage() {
//   const { user, profile } = useAuth();
//   const isSuperFan = profile?.is_super_fan ?? false;

//   const [allEras, setAllEras] = useState<Era[]>([]);
//   const [albums, setAlbums] = useState<Album[]>([]);
//   const [songs, setSongs] = useState<Song[]>([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const [showEraModal, setShowEraModal] = useState(false);
//   const [editingEra, setEditingEra] = useState<Era | null>(null);
//   const [gridDetailEra, setGridDetailEra] = useState<Era | null>(null);

//   const [searchInput, setSearchInput] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

//   const [viewMode, setViewMode] = useState<ViewMode>(() => {
//     const stored = localStorage.getItem(STORAGE_KEY);
//     return stored === 'grid' ? 'grid' : 'list';
//   });

//   const [page, setPage] = useState(1);

//   // ── Data loading ────────────────────────────────────────────────────
//   const loadEras = useCallback(async (pageNum: number, query: string) => {
//     if (!user) return;
//     setLoading(true);

//     const from = (pageNum - 1) * PAGE_SIZE;
//     const to = from + PAGE_SIZE - 1;

//     let q = supabase
//       .from('eras')
//       .select('*', { count: 'exact' })
//       .eq('user_id', user.id)
//       .order('end_date', { ascending: true, nullsFirst: true })
//       .order('start_date', { ascending: false })
//       .order('created_at', { ascending: false })
//       .range(from, to);

//     if (query) {
//       q = supabase
//         .from('eras')
//         .select('*', { count: 'exact' })
//         .eq('user_id', user.id)
//         .order('end_date', { ascending: true, nullsFirst: true })
//         .order('start_date', { ascending: false })
//         .order('created_at', { ascending: false });
//     }

//     const { data, count } = await q;

//     if (data) {
//       if (query) {
//         const filtered = data.filter(e => matchesSearch(e, query));
//         const pageStart = (pageNum - 1) * PAGE_SIZE;
//         setAllEras(filtered.slice(pageStart, pageStart + PAGE_SIZE));
//         setTotalCount(filtered.length);
//       } else {
//         setAllEras(sortEras(data));
//         setTotalCount(count ?? 0);
//       }
//     }

//     setLoading(false);
//   }, [user]);

//   const loadAlbumsAndSongs = useCallback(async () => {
//     if (!user) return;
//     const { data: albumsData } = await supabase
//       .from('albums').select('*').eq('user_id', user.id).order('listened_on', { ascending: true });
//     if (albumsData) setAlbums(albumsData);

//     if (isSuperFan) {
//       const { data: songsData } = await supabase
//         .from('songs').select('*').eq('user_id', user.id).order('track_number', { ascending: true });
//       if (songsData) setSongs(songsData);
//     }
//   }, [user, isSuperFan]);

//   useEffect(() => {
//     loadEras(page, searchQuery);
//   }, [loadEras, page, searchQuery]);

//   useEffect(() => {
//     loadAlbumsAndSongs();
//   }, [loadAlbumsAndSongs]);

//   function handleSearchChange(value: string) {
//     setSearchInput(value);
//     clearTimeout(searchDebounce.current);
//     searchDebounce.current = setTimeout(() => {
//       setSearchQuery(value);
//       setPage(1);
//     }, 250);
//   }

//   function clearSearch() {
//     setSearchInput('');
//     setSearchQuery('');
//     setPage(1);
//   }

//   function toggleViewMode(mode: ViewMode) {
//     setViewMode(mode);
//     localStorage.setItem(STORAGE_KEY, mode);
//   }

//   async function handleSaveEra(data: EraPayload) {
//     if (!user) return;
//     const { albums: albumDrafts, ...eraData } = data;

//     if (editingEra) {
//       await supabase.from('eras').update(eraData).eq('id', editingEra.id);
//     } else {
//       const { data: inserted } = await supabase
//         .from('eras').insert({ ...eraData, user_id: user.id }).select('id').single();

//       if (inserted && albumDrafts && albumDrafts.length > 0) {
//         for (const albumDraft of albumDrafts) {
//           const { data: albumInserted } = await supabase
//             .from('albums')
//             .insert({
//               era_id: inserted.id,
//               user_id: user.id,
//               title: albumDraft.title,
//               note: albumDraft.note,
//               cover_url: albumDraft.cover_url,
//               listened_on: albumDraft.listened_on,
//             })
//             .select('id').single();

//           if (albumInserted && albumDraft.songs.length > 0) {
//             await supabase.from('songs').insert(
//               albumDraft.songs.map(s => ({
//                 album_id: albumInserted.id,
//                 user_id: user.id,
//                 title: s.title,
//                 track_number: s.track_number,
//                 note: s.note,
//                 is_favorite: s.is_favorite,
//               }))
//             );
//           }
//         }
//       }
//     }

//     setShowEraModal(false);
//     setEditingEra(null);
//     await loadEras(page, searchQuery);
//     await loadAlbumsAndSongs();
//   }

//   async function handleDeleteAlbum(albumId: string) {
//   await supabase.from('songs').delete().eq('album_id', albumId);
//   await supabase.from('albums').delete().eq('id', albumId);
//   await loadAlbumsAndSongs();
// }
//   async function handleDeleteEra(era: Era) {
//     if (!confirm(`Delete your ${era.band_name} era? This can't be undone.`)) return;
//     await supabase.from('eras').delete().eq('id', era.id);
//     await loadEras(page, searchQuery);
//   }

//   async function handleMarkEnded(era: Era) {
//     await supabase.from('eras').update({ end_date: new Date().toISOString().slice(0, 10) }).eq('id', era.id);
//     await loadEras(page, searchQuery);
//   }

//   const totalPages = Math.ceil(totalCount / PAGE_SIZE);
//   const showPagination = totalCount > PAGE_SIZE;

//   const eraAlbums = (era: Era) => albums.filter(a => a.era_id === era.id);
//   const eraAlbumIds = (era: Era) => eraAlbums(era).map(a => a.id);
//   const eraSongs = (era: Era) => songs.filter(s => eraAlbumIds(era).includes(s.album_id));

//   const activeEras = allEras.filter(e => !e.end_date);
//   const endedEras = allEras.filter(e => e.end_date);

//   if (loading && allEras.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-[50vh]">
//         <div className="w-8 h-8 border-2 border-ink-700 border-t-ember-500 rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-10">

//       {/* ── Page header ────────────────────────────────────────────── */}
//       <div className="mb-8">
//         <h1 className="font-display text-3xl font-bold text-ink-50 leading-tight">Your Eras</h1>
//         <p className="text-ink-500 text-sm mt-1">
//           {totalCount > 0
//             ? `${totalCount} obsession${totalCount !== 1 ? 's' : ''} logged`
//             : 'A diary of musical rabbit holes'}
//         </p>
//       </div>

//       {/* ── Toolbar ─────────────────────────────────────────────────── */}
//       <div className="flex flex-col sm:flex-row gap-3 mb-8">
//         <div className="relative flex-1">
//           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
//           <input
//             type="text"
//             value={searchInput}
//             onChange={e => handleSearchChange(e.target.value)}
//             placeholder="Search by band, genre, or note..."
//             className={cn(
//               'h-11 w-full bg-ink-900/60 border border-ink-800/80 rounded-xl pl-10 pr-10 text-sm',
//               'text-ink-100 placeholder-ink-600',
//               'focus:outline-none focus:border-ink-600 focus:bg-ink-900/80 transition-all',
//             )}
//           />
//           {searchInput && (
//             <button
//               onClick={clearSearch}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           )}
//         </div>

//         <div className="flex items-center gap-2 shrink-0">
//           <div className="flex items-center h-11 bg-ink-900/60 border border-ink-800/80 rounded-xl px-1 gap-0.5">
//             <button
//               onClick={() => toggleViewMode('list')}
//               className={cn(
//                 'flex items-center justify-center w-9 h-9 rounded-lg text-xs font-medium transition-all',
//                 viewMode === 'list'
//                   ? 'bg-ink-700/80 text-ink-100 shadow-sm'
//                   : 'text-ink-500 hover:text-ink-300',
//               )}
//               title="List view"
//             >
//               <LayoutList className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => toggleViewMode('grid')}
//               className={cn(
//                 'flex items-center justify-center w-9 h-9 rounded-lg text-xs font-medium transition-all',
//                 viewMode === 'grid'
//                   ? 'bg-ink-700/80 text-ink-100 shadow-sm'
//                   : 'text-ink-500 hover:text-ink-300',
//               )}
//               title="Grid view"
//             >
//               <LayoutGrid className="w-4 h-4" />
//             </button>
//           </div>

//           <Button
//             onClick={() => { setEditingEra(null); setShowEraModal(true); }}
//             size="default"
//             className="gap-2 whitespace-nowrap h-11 px-5 rounded-xl"
//           >
//             <Plus className="w-4 h-4" />
//             Log Era
//           </Button>
//         </div>
//       </div>

//       {/* ── Search result count ──────────────────────────────────────── */}
//       {searchQuery && (
//         <p className="text-ink-500 text-sm mb-5">
//           <span className="text-ink-200 font-medium">{totalCount}</span>{' '}
//           era{totalCount !== 1 ? 's' : ''} matching{' '}
//           <span className="text-ink-300">"{searchQuery}"</span>
//         </p>
//       )}

//       {/* ── Empty state ──────────────────────────────────────────────── */}
//       {!loading && allEras.length === 0 && (
//         <div className="text-center py-20 animate-in fade-in-0 duration-500">
//           {searchQuery ? (
//             <>
//               <div className="w-14 h-14 rounded-full bg-ink-800 flex items-center justify-center mx-auto mb-4">
//                 <Search className="w-6 h-6 text-ink-600" />
//               </div>
//               <h3 className="font-display text-xl text-ink-300 mb-2">No results</h3>
//               <p className="text-ink-600 text-sm">No eras match "{searchQuery}".</p>
//               <button onClick={clearSearch} className="mt-4 text-sm text-ember-400 hover:text-ember-300 transition-colors">
//                 Clear search
//               </button>
//             </>
//           ) : (
//             <>
//               <div className="w-16 h-16 rounded-full bg-ink-800 flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-ink-600" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0C17 8 12 2 12 2zm0 15.5a3 3 0 01-2.83-4c.5-1.5 1.83-3 2.83-4.5 1 1.5 2.33 3 2.83 4.5A3 3 0 0112 17.5z" />
//                 </svg>
//               </div>
//               <h3 className="font-display text-xl text-ink-300 mb-2">No eras yet</h3>
//               <p className="text-ink-600 text-sm max-w-xs mx-auto">You've fallen down no rabbit holes. That seems unlikely. Log your first obsession.</p>
//               <Button onClick={() => setShowEraModal(true)} className="mt-6 gap-2">
//                 <Plus className="w-4 h-4" />
//                 Log Your First Era
//               </Button>
//             </>
//           )}
//         </div>
//       )}

//       {/* ── List view ────────────────────────────────────────────────── */}
//       {viewMode === 'list' && allEras.length > 0 && (
//         <>
//           {activeEras.length > 0 && (
//             <section className="mb-10">
//               <div className="flex items-center gap-3 mb-5">
//                 <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ember-500">
//                   Currently Spiraling
//                 </h2>
//                 <div className="h-px flex-1 bg-gradient-to-r from-ember-500/20 to-transparent" />
//                 <span className="text-[10px] font-medium text-ink-600 tabular-nums">{activeEras.length}</span>
//               </div>
//               <div className="space-y-4">
//                 {activeEras.map(era => (
//                   <div key={era.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
//                    <EraCard
//   era={gridDetailEra}
//   albums={eraAlbums(gridDetailEra)}
//   songs={eraSongs(gridDetailEra)}
//   isSuperFan={isSuperFan}
//   onEdit={() => { setEditingEra(gridDetailEra); setGridDetailEra(null); setShowEraModal(true); }}
//   onDelete={() => { handleDeleteEra(gridDetailEra); setGridDetailEra(null); }}
//   onMarkEnded={() => { handleMarkEnded(gridDetailEra); setGridDetailEra(null); }}
//   onDeleteAlbum={handleDeleteAlbum}
// />
//                   </div>
//                 ))}
//               </div>
//             </section>
//           )}

//           {endedEras.length > 0 && (
//             <section>
//               <div className="flex items-center gap-3 mb-5">
//                 <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-600">
//                   Past Eras
//                 </h2>
//                 <div className="h-px flex-1 bg-gradient-to-r from-ink-700/40 to-transparent" />
//                 <span className="text-[10px] font-medium text-ink-600 tabular-nums">{endedEras.length}</span>
//               </div>
//               <div className="space-y-4">
//                 {endedEras.map(era => (
//                   <div key={era.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
//                     <EraCard
//                       era={era}
//                       albums={eraAlbums(era)}
//                       songs={eraSongs(era)}
//                       isSuperFan={isSuperFan}
//                       onEdit={() => { setEditingEra(era); setShowEraModal(true); }}
//                       onDelete={() => handleDeleteEra(era)}
//                       onMarkEnded={() => handleMarkEnded(era)}
//                     />
//                   </div>
//                 ))}
//               </div>
//             </section>
//           )}
//         </>
//       )}

//       {/* ── Grid view ────────────────────────────────────────────────── */}
//       {viewMode === 'grid' && allEras.length > 0 && (
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in-0 duration-300">
//           {allEras.map(era => (
//             <GridCard
//               key={era.id}
//               era={era}
//               onClick={() => setGridDetailEra(era)}
//             />
//           ))}
//         </div>
//       )}

//       {/* ── Pagination ───────────────────────────────────────────────── */}
//       {showPagination && !loading && allEras.length > 0 && (
//         <div className="flex items-center justify-center gap-2 mt-12">
//           <button
//             onClick={() => setPage(p => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className={cn(
//               'flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
//               page === 1
//                 ? 'text-ink-700 cursor-not-allowed'
//                 : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800/60',
//             )}
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Prev
//           </button>

//           <span className="text-ink-500 text-sm px-3">
//             Page <span className="text-ink-200 font-medium tabular-nums">{page}</span> of{' '}
//             <span className="text-ink-200 font-medium tabular-nums">{totalPages}</span>
//           </span>

//           <button
//             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//             disabled={page === totalPages}
//             className={cn(
//               'flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
//               page === totalPages
//                 ? 'text-ink-700 cursor-not-allowed'
//                 : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800/60',
//             )}
//           >
//             Next
//             <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       )}

//       {/* ── Grid detail modal ─────────────────────────────────────────── */}
//       <Dialog open={!!gridDetailEra} onOpenChange={open => { if (!open) setGridDetailEra(null); }}>
//         <DialogContent className="max-w-2xl p-0 overflow-hidden bg-transparent border-0 shadow-none [&>button]:hidden">
//           {gridDetailEra && (
//             <div className="max-h-[90vh] overflow-y-auto">
//               <EraCard
//                 era={gridDetailEra}
//                 albums={eraAlbums(gridDetailEra)}
//                 songs={eraSongs(gridDetailEra)}
//                 isSuperFan={isSuperFan}
//                 onEdit={() => { setEditingEra(gridDetailEra); setGridDetailEra(null); setShowEraModal(true); }}
//                 onDelete={() => { handleDeleteEra(gridDetailEra); setGridDetailEra(null); }}
//                 onMarkEnded={() => { handleMarkEnded(gridDetailEra); setGridDetailEra(null); }}
//               />
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* ── Era modal ───────────────────────────────────────────────── */}
//       {showEraModal && (
//         <EraModal
//           era={editingEra}
//           isSuperFan={isSuperFan}
//           onSave={handleSaveEra}
//           onClose={() => { setShowEraModal(false); setEditingEra(null); }}
//         />
//       )}
//     </div>
//   );
// }
