import { useState, FormEvent } from 'react';
import { Plus, Music2, Star, Trash2 } from 'lucide-react';
import { Era, Album } from '../lib/supabase';
import { searchAlbumCover } from '../lib/deezer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { DatePicker } from './ui/date-picker';

type SongDraft = {
  title: string;
  track_number: number | null;
  note: string;
  is_favorite: boolean;
};

type Props = {
  era: Era;
  onSave: (data: Partial<Album>, songs?: SongDraft[]) => Promise<void>;
  onClose: () => void;
};

export default function AlbumModal({ era, onSave, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [listenedOn, setListenedOn] = useState('');
  const [saving, setSaving] = useState(false);
  const [songs, setSongs] = useState<SongDraft[]>([]);
  const [showSongForm, setShowSongForm] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songNote, setSongNote] = useState('');
  const [songFavorite, setSongFavorite] = useState(false);

  function addSong() {
    if (!songTitle.trim()) return;
    setSongs(prev => [...prev, {
      title: songTitle.trim(),
      track_number: prev.length + 1,
      note: songNote,
      is_favorite: songFavorite,
    }]);
    setSongTitle('');
    setSongNote('');
    setSongFavorite(false);
    setShowSongForm(false);
  }

  function removeSong(index: number) {
    setSongs(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const cover_url = await searchAlbumCover(era.band_name, title).catch(() => null);
    await onSave(
      { era_id: era.id, title, note, cover_url, listened_on: listenedOn || null },
      songs.length > 0 ? songs : undefined
    );
    setSaving(false);
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add Album</DialogTitle>
          <DialogDescription>{era.band_name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Album Title <span className="text-ember-500">*</span></Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Murder Ballads"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Date Listened <span className="text-ink-600">(optional)</span></Label>
            <DatePicker value={listenedOn} onChange={setListenedOn} placeholder="Pick a date" />
          </div>
          <div className="space-y-2">
            <Label>Note <span className="text-ink-600">(optional)</span></Label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Made me feel..."
              rows={2}
            />
          </div>

          <Separator />

          {/* Songs Section */}
          <div className="space-y-3">
            <Label>Standout Songs <span className="text-ink-600">(optional)</span></Label>

            {songs.length > 0 && (
              <div className="space-y-2">
                {songs.map((song, i) => (
                  <div key={i} className="flex items-center gap-2 bg-ink-800/60 rounded-lg px-3 py-2">
                    <Music2 className="w-3.5 h-3.5 text-ink-500 shrink-0" />
                    <span className="text-ink-200 text-sm flex-1 truncate">{song.title}</span>
                    {song.is_favorite && <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400 shrink-0" />}
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSong(i)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {showSongForm ? (
              <div className="bg-ink-800/40 border border-ink-700 rounded-xl p-3 space-y-3">
                <Input value={songTitle} onChange={e => setSongTitle(e.target.value)} placeholder="Song title" autoFocus />
                <Input value={songNote} onChange={e => setSongNote(e.target.value)} placeholder="Quick note (optional)" />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={songFavorite ? 'gold' : 'ghost'}
                    size="sm"
                    className="gap-1"
                    onClick={() => setSongFavorite(f => !f)}
                  >
                    <Star className={`w-3 h-3 ${songFavorite ? 'fill-gold-400' : ''}`} />
                    Favorite
                  </Button>
                  <div className="flex-1" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowSongForm(false)}>Cancel</Button>
                  <Button type="button" size="sm" disabled={!songTitle.trim()} onClick={addSong}>Add</Button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowSongForm(true)} className="flex items-center gap-1.5 text-xs text-ember-400 hover:text-ember-300 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add a song
              </button>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Add Album
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
