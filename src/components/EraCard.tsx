import { Pencil, Trash2, CheckCircle, Disc, Music2, Star, MoreHorizontal, Play, Flame, X } from 'lucide-react';
import { Era, Album, Song } from '../lib/supabase';
import { generateCommentary } from '../lib/commentary';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Props = {
  era: Era;
  albums?: Album[];
  songs?: Song[];
  isSuperFan: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMarkEnded: () => void;
  onAddAlbum?: () => void;
  onDeleteAlbum?: (albumId: string) => void;
};

function daysDeep(startDate: string) {
  return Math.floor((Date.now() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(days: number) {
  if (days < 7) return `${days} days`;
  if (days < 60) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  const years = Math.floor(days / 365);
  const remMonths = Math.floor((days % 365) / 30);
  return remMonths > 0 ? `${years}y ${remMonths}mo` : `${years} year${years !== 1 ? 's' : ''}`;
}

const FLAME_COLORS: Record<number, string> = {
  1: 'text-ink-500',
  2: 'text-gold-400',
  3: 'text-ember-400',
  4: 'text-ember-500',
  5: 'text-ember-400',
};
const LEVEL_LABELS = ['', 'Casual', 'Into It', 'Deep', 'Spiraling', 'Full Collapse'];

export default function EraCard({
  era,
  albums = [],
  songs = [],
  isSuperFan,
  onEdit,
  onDelete,
  onMarkEnded,
  onDeleteAlbum,
}: Props) {
  const isActive = !era.end_date;
  const days = daysDeep(era.start_date);
  const commentary = generateCommentary(era.band_name, era.obsession_level, era.start_date);
  const flameColor = FLAME_COLORS[era.obsession_level];

  const cardBg = isActive
    ? 'bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950'
    : 'bg-ink-900/70';

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 group border-ink-800/60',
        'hover:border-ink-700/80 hover:shadow-xl hover:shadow-black/40',
        cardBg,
        isActive && 'border-ember-900/40',
      )}
    >
      {/* Active tint overlay */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-ember-950/30 via-transparent to-transparent pointer-events-none" />
      )}

      {/* ── Main horizontal layout ──────────────────────────────────────── */}
      <div className="relative flex flex-col sm:flex-row">

        {/* ── Cover image ─────────────────────────────────────────────── */}
        <div className={cn(
          'shrink-0 relative',
          isActive
            ? 'w-full sm:w-[200px] h-48 sm:h-auto sm:min-h-[200px]'
            : 'w-full sm:w-[140px] h-36 sm:h-auto sm:min-h-[140px]'
        )}>
          {era.band_image_url ? (
            <img
              src={era.band_image_url}
              alt={era.band_name}
              className="w-full h-full object-cover sm:rounded-none"
              loading="lazy"
            />
          ) : (
            <div className={cn(
              'w-full h-full flex items-center justify-center',
              isActive ? 'bg-gradient-to-br from-ember-950/60 to-ink-900' : 'bg-ink-800/60'
            )}>
              <Music2 className={cn('opacity-30', isActive ? 'w-16 h-16 text-ember-400' : 'w-10 h-10 text-ink-500')} />
            </div>
          )}

          {/* Image fade into content on sm+ */}
          <div className="hidden sm:block absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-ink-900 pointer-events-none" />

          {/* Bottom mobile fade */}
          <div className="sm:hidden absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink-900 to-transparent pointer-events-none" />
        </div>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 p-6 sm:pl-5">

          {/* ── Top row: eyebrow + menu ──────────────────────────────── */}
          <div className="flex items-start justify-between gap-2 mb-3">
            {/* Eyebrow status label */}
            <div className="flex items-center gap-2">
              {isActive ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-70" />
                    <span className="relative rounded-full bg-green-400 w-1.5 h-1.5" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400">
                    Active Era
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-600">
                  Past Era
                </span>
              )}
              {isSuperFan && (
                <Star className="w-3 h-3 text-gold-400 fill-gold-400 shrink-0" />
              )}
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-ink-500 hover:text-ink-100 hover:bg-ink-800 transition-colors shrink-0 -mt-0.5 -mr-1"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onEdit} className="gap-2">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </DropdownMenuItem>
                {isActive && (
                  <DropdownMenuItem onClick={onMarkEnded} className="gap-2 text-green-400 focus:text-green-300">
                    <CheckCircle className="w-3.5 h-3.5" />
                    End era
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="gap-2 text-ember-500 focus:text-ember-400">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ── Band name ────────────────────────────────────────────── */}
          <h3 className={cn(
            'font-display font-bold text-ink-50 leading-tight tracking-tight mb-1 truncate',
            isActive ? 'text-3xl sm:text-[32px]' : 'text-2xl sm:text-3xl'
          )}>
            {era.band_name}
          </h3>

          {/* ── Genres ──────────────────────────────────────────────── */}
          {era.genres && era.genres.length > 0 && (
            <p className="text-ink-500 text-sm mb-3 truncate">
              {era.genres.slice(0, 4).join(', ')}
            </p>
          )}

          {/* ── Metadata row ────────────────────────────────────────── */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-ink-500 text-sm mb-4">
            <span className="text-ink-300 font-medium tabular-nums">{formatDuration(days)}</span>
            {albums.length > 0 && (
              <>
                <span className="text-ink-700">·</span>
                <span>{albums.length} album{albums.length !== 1 ? 's' : ''}</span>
              </>
            )}
            {songs.length > 0 && (
              <>
                <span className="text-ink-700">·</span>
                <span>{songs.length} song{songs.length !== 1 ? 's' : ''}</span>
              </>
            )}
            <span className="text-ink-700">·</span>
            <span>
              {isActive
                ? `Started ${formatDate(era.start_date)}`
                : `${formatDate(era.start_date)} – ${formatDate(era.end_date!)}`}
            </span>
          </div>

          {/* ── Obsession + primary CTA row ─────────────────────────── */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Flame
                    key={i}
                    className={cn(
                      'w-3.5 h-3.5 transition-colors',
                      i < era.obsession_level ? flameColor : 'text-ink-800'
                    )}
                    fill={i < era.obsession_level ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className={cn('text-sm font-medium', flameColor)}>
                {LEVEL_LABELS[era.obsession_level]}
              </span>
            </div>

            {!isSuperFan && (
              <button
                onClick={onEdit}
                className={cn(
                  'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 shrink-0',
                  'bg-ink-100 text-ink-950 hover:bg-white hover:scale-105 active:scale-95 shadow-md'
                )}
              >
                <Play className="w-3.5 h-3.5 fill-ink-950" />
                Edit era
              </button>
            )}
          </div>

          {/* ── Album shelf (Super Fan) ──────────────────────────────── */}
          {isSuperFan && albums.length > 0 && (
            <div className="relative mb-5 -mx-1">
              <div className="flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide">
                {albums.map(a => {
                  const albumSongs = songs.filter(s => s.album_id === a.id);
                  const favSongs = albumSongs.filter(s => s.is_favorite);
                  return (
                    <div key={a.id} className="shrink-0 w-[88px] group/album">
                      <div className="relative">
                        {a.cover_url ? (
                          <img
                            src={a.cover_url}
                            alt={a.title}
                            className="w-[88px] h-[88px] rounded-lg object-cover ring-1 ring-ink-700/60 mb-1.5 group-hover/album:ring-ink-500 transition-all"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-[88px] h-[88px] rounded-lg bg-ink-800 flex items-center justify-center ring-1 ring-ink-700/60 mb-1.5 group-hover/album:ring-ink-500 transition-all">
                            <Disc className="w-7 h-7 text-ink-600" />
                          </div>
                        )}
                        {onDeleteAlbum && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Remove "${a.title}"?`)) onDeleteAlbum(a.id);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink-950/80 text-ink-300 hover:bg-ember-500 hover:text-white opacity-0 group-hover/album:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm"
                            title="Remove album"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-ink-200 text-xs font-medium truncate leading-tight">{a.title}</p>
                      {albumSongs.length > 0 && (
                        <p className="text-ink-600 text-[11px] mt-0.5">
                          {albumSongs.length} track{albumSongs.length !== 1 ? 's' : ''}
                          {favSongs.length > 0 && ` · ${favSongs.length}★`}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Right fade gradient */}
              <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-ink-900 to-transparent pointer-events-none" />
            </div>
          )}

          {/* ── Commentary ──────────────────────────────────────────── */}
          <p className="text-ink-400 text-sm italic leading-relaxed mb-3">
            {commentary}
          </p>

          {/* ── Note ────────────────────────────────────────────────── */}
          {era.note && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-600 mb-1">
                Your note
              </p>
              <p className="text-ink-300 text-sm leading-relaxed">{era.note}</p>
            </div>
          )}

        </div>
      </div>
    </Card>
  );
}


// import { Pencil, Trash2, CheckCircle, Disc, Music2, Star, MoreHorizontal, Play, Flame, X } from 'lucide-react';
// import { Era, Album, Song } from '../lib/supabase';
// import { generateCommentary } from '../lib/commentary';
// import { Button } from './ui/button';
// import { Card } from './ui/card';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from './ui/dropdown-menu';
// import { cn } from '@/lib/utils';

// type Props = {
//   era: Era;
//   albums?: Album[];
//   songs?: Song[];
//   isSuperFan: boolean;
//   onEdit: () => void;
//   onDelete: () => void;
//   onMarkEnded: () => void;
//   onAddAlbum?: () => void;
//   onDeleteAlbum?: (albumId: string) => void;
// };

// function daysDeep(startDate: string) {
//   return Math.floor((Date.now() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000));
// }

// function formatDate(d: string) {
//   return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
// }

// function formatDuration(days: number) {
//   if (days < 7) return `${days} days`;
//   if (days < 60) return `${Math.floor(days / 7)} weeks`;
//   if (days < 365) return `${Math.floor(days / 30)} months`;
//   const years = Math.floor(days / 365);
//   const remMonths = Math.floor((days % 365) / 30);
//   return remMonths > 0 ? `${years}y ${remMonths}mo` : `${years} year${years !== 1 ? 's' : ''}`;
// }

// const FLAME_COLORS: Record<number, string> = {
//   1: 'text-ink-500',
//   2: 'text-gold-400',
//   3: 'text-ember-400',
//   4: 'text-ember-500',
//   5: 'text-ember-400',
// };
// const LEVEL_LABELS = ['', 'Casual', 'Into It', 'Deep', 'Spiraling', 'Full Collapse'];

// export default function EraCard({
//   era,
//   albums = [],
//   songs = [],
//   isSuperFan,
//   onEdit,
//   onDelete,
//   onMarkEnded,
//   onAddAlbum,
//   onDeleteAlbum,
// }: Props) {
//   const isActive = !era.end_date;
//   const days = daysDeep(era.start_date);
//   const commentary = generateCommentary(era.band_name, era.obsession_level, era.start_date);
//   const flameColor = FLAME_COLORS[era.obsession_level];

//   const cardBg = isActive
//     ? 'bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950'
//     : 'bg-ink-900/70';

//   return (
//     <Card
//       className={cn(
//         'relative overflow-hidden transition-all duration-300 group border-ink-800/60',
//         'hover:border-ink-700/80 hover:shadow-xl hover:shadow-black/40',
//         cardBg,
//         isActive && 'border-ember-900/40',
//       )}
//     >
//       {/* Active tint overlay */}
//       {isActive && (
//         <div className="absolute inset-0 bg-gradient-to-r from-ember-950/30 via-transparent to-transparent pointer-events-none" />
//       )}

//       {/* ── Main horizontal layout ──────────────────────────────────────── */}
//       <div className="relative flex flex-col sm:flex-row">

//         {/* ── Cover image ─────────────────────────────────────────────── */}
//         <div className={cn(
//           'shrink-0 relative',
//           isActive
//             ? 'w-full sm:w-[200px] h-48 sm:h-auto sm:min-h-[200px]'
//             : 'w-full sm:w-[140px] h-36 sm:h-auto sm:min-h-[140px]'
//         )}>
//           {era.band_image_url ? (
//             <img
//               src={era.band_image_url}
//               alt={era.band_name}
//               className="w-full h-full object-cover sm:rounded-none"
//               loading="lazy"
//             />
//           ) : (
//             <div className={cn(
//               'w-full h-full flex items-center justify-center',
//               isActive ? 'bg-gradient-to-br from-ember-950/60 to-ink-900' : 'bg-ink-800/60'
//             )}>
//               <Music2 className={cn('opacity-30', isActive ? 'w-16 h-16 text-ember-400' : 'w-10 h-10 text-ink-500')} />
//             </div>
//           )}

//           {/* Image fade into content on sm+ */}
//           <div className="hidden sm:block absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-ink-900 pointer-events-none" />

//           {/* Bottom mobile fade */}
//           <div className="sm:hidden absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink-900 to-transparent pointer-events-none" />
//         </div>

//         {/* ── Content ─────────────────────────────────────────────────── */}
//         <div className="flex-1 min-w-0 p-6 sm:pl-5">

//           {/* ── Top row: eyebrow + menu ──────────────────────────────── */}
//           <div className="flex items-start justify-between gap-2 mb-3">
//             {/* Eyebrow status label */}
//             <div className="flex items-center gap-2">
//               {isActive ? (
//                 <div className="flex items-center gap-1.5">
//                   <span className="relative flex w-1.5 h-1.5">
//                     <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-70" />
//                     <span className="relative rounded-full bg-green-400 w-1.5 h-1.5" />
//                   </span>
//                   <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-400">
//                     Active Era
//                   </span>
//                 </div>
//               ) : (
//                 <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-600">
//                   Past Era
//                 </span>
//               )}
//               {isSuperFan && (
//                 <Star className="w-3 h-3 text-gold-400 fill-gold-400 shrink-0" />
//               )}
//             </div>

//             {/* Hover-reveal menu */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-7 w-7 text-ink-500 hover:text-ink-100 hover:bg-ink-800 transition-colors shrink-0 -mt-0.5 -mr-1">
//                   <MoreHorizontal className="w-4 h-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-40">
//                 <DropdownMenuItem onClick={onEdit} className="gap-2">
//                   <Pencil className="w-3.5 h-3.5" />
//                   Edit
//                 </DropdownMenuItem>
//                 {isActive && (
//                   <DropdownMenuItem onClick={onMarkEnded} className="gap-2 text-green-400 focus:text-green-300">
//                     <CheckCircle className="w-3.5 h-3.5" />
//                     End era
//                   </DropdownMenuItem>
//                 )}
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={onDelete} className="gap-2 text-ember-500 focus:text-ember-400">
//                   <Trash2 className="w-3.5 h-3.5" />
//                   Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>

//           {/* ── Band name ────────────────────────────────────────────── */}
//           <h3 className={cn(
//             'font-display font-bold text-ink-50 leading-tight tracking-tight mb-1 truncate',
//             isActive ? 'text-3xl sm:text-[32px]' : 'text-2xl sm:text-3xl'
//           )}>
//             {era.band_name}
//           </h3>

//           {/* ── Genres — plain text Spotify-style ───────────────────── */}
//           {era.genres && era.genres.length > 0 && (
//             <p className="text-ink-500 text-sm mb-3 truncate">
//               {era.genres.slice(0, 4).join(', ')}
//             </p>
//           )}

//           {/* ── Metadata row: days · albums · started ───────────────── */}
//           <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-ink-500 text-sm mb-4">
//             <span className="text-ink-300 font-medium tabular-nums">{formatDuration(days)}</span>
//             {albums.length > 0 && (
//               <>
//                 <span className="text-ink-700">·</span>
//                 <span>{albums.length} album{albums.length !== 1 ? 's' : ''}</span>
//               </>
//             )}
//             {songs.length > 0 && (
//               <>
//                 <span className="text-ink-700">·</span>
//                 <span>{songs.length} song{songs.length !== 1 ? 's' : ''}</span>
//               </>
//             )}
//             <span className="text-ink-700">·</span>
//             <span>
//               {isActive
//                 ? `Started ${formatDate(era.start_date)}`
//                 : `${formatDate(era.start_date)} – ${formatDate(era.end_date!)}`}
//             </span>
//           </div>

//           {/* ── Obsession + primary CTA row ─────────────────────────── */}
//           <div className="flex items-center justify-between gap-4 mb-5">
//             {/* Inline flames + label */}
//             <div className="flex items-center gap-2">
//               <div className="flex gap-0.5">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <Flame
//                     key={i}
//                     className={cn(
//                       'w-3.5 h-3.5 transition-colors',
//                       i < era.obsession_level ? flameColor : 'text-ink-800'
//                     )}
//                     fill={i < era.obsession_level ? 'currentColor' : 'none'}
//                   />
//                 ))}
//               </div>
//               <span className={cn('text-sm font-medium', flameColor)}>
//                 {LEVEL_LABELS[era.obsession_level]}
//               </span>
//             </div>

//             {/* Primary CTA */}
//             {!isSuperFan && (
//               <button
//                 onClick={onEdit}
//                 className={cn(
//                   'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 shrink-0',
//                   'bg-ink-100 text-ink-950 hover:bg-white hover:scale-105 active:scale-95 shadow-md'
//                 )}
//               >
//                 <Play className="w-3.5 h-3.5 fill-ink-950" />
//                 Edit era
//               </button>
//             )}
//           </div>

//           {/* ── Album shelf (Super Fan) ──────────────────────────────── */}
//           {isSuperFan && albums.length > 0 && (
//             <div className="relative mb-5 -mx-1">
//               <div className="flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide">
//                 {albums.map(a => {
//                   const albumSongs = songs.filter(s => s.album_id === a.id);
//                   const favSongs = albumSongs.filter(s => s.is_favorite);
//                   return (
//                     <div key={a.id} className="shrink-0 w-[88px] group/album">
//                       {a.cover_url ? (
//                         <img
//                           src={a.cover_url}
//                           alt={a.title}
//                           className="w-[88px] h-[88px] rounded-lg object-cover ring-1 ring-ink-700/60 mb-1.5 group-hover/album:ring-ink-500 transition-all"
//                           loading="lazy"
//                         />
//                       ) : (
//                         <div className="w-[88px] h-[88px] rounded-lg bg-ink-800 flex items-center justify-center ring-1 ring-ink-700/60 mb-1.5 group-hover/album:ring-ink-500 transition-all">
//                           <Disc className="w-7 h-7 text-ink-600" />
//                         </div>
//                       )}
//                       <p className="text-ink-200 text-xs font-medium truncate leading-tight">{a.title}</p>
//                       {albumSongs.length > 0 && (
//                         <p className="text-ink-600 text-[11px] mt-0.5">
//                           {albumSongs.length} track{albumSongs.length !== 1 ? 's' : ''}
//                           {favSongs.length > 0 && ` · ${favSongs.length}★`}
//                         </p>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//               {/* Right fade gradient */}
//               <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-ink-900 to-transparent pointer-events-none" />
//             </div>
//           )}

//           {/* ── Commentary ──────────────────────────────────────────── */}
//           <p className="text-ink-400 text-sm italic leading-relaxed mb-3">
//             {commentary}
//           </p>

//           {/* ── Note ────────────────────────────────────────────────── */}
//           {era.note && (
//             <div>
//               <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-600 mb-1">
//                 Your note
//               </p>
//               <p className="text-ink-300 text-sm leading-relaxed">{era.note}</p>
//             </div>
//           )}

//         </div>
//       </div>
//     </Card>
//   );
// }
