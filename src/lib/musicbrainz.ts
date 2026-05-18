export type MBBand = {
  id: string;
  name: string;
  disambiguation?: string;
  genres: string[];
};

export async function searchBands(query: string): Promise<MBBand[]> {
  if (!query.trim()) return [];

  const url = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(query)}&limit=8&fmt=json`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'EraLog/1.0 (eralog.app)' },
  });

  if (!res.ok) return [];

  const data = await res.json();

  return (data.artists || []).map((a: {
    id: string;
    name: string;
    disambiguation?: string;
    tags?: Array<{ name: string; count: number }>;
  }) => ({
    id: a.id,
    name: a.name,
    disambiguation: a.disambiguation,
    genres: (a.tags || [])
      .sort((x: { count: number }, y: { count: number }) => y.count - x.count)
      .slice(0, 5)
      .map((t: { name: string }) => t.name),
  }));
}
