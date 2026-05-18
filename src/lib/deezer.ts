const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deezer-proxy`;

async function deezerProxy(type: 'artist' | 'album' | 'track', q: string): Promise<unknown> {
  const url = `${PROXY_URL}?type=${type}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    }, 
  });
  if (!res.ok) return null;
  return res.json();
}

export async function searchArtistImage(name: string): Promise<string | null> {
  try {
    const data = await deezerProxy('artist', name) as { data?: { picture_big?: string }[] } | null;
    const url = data?.data?.[0]?.picture_big;
    if (!url || url.includes('/artist//')) return null;
    return url;
  } catch {
    return null;
  }
}

export async function searchAlbumCover(artist: string, album: string): Promise<string | null> {
  try {
    const q = `artist:"${artist}" album:"${album}"`;
    const data = await deezerProxy('album', q) as { data?: { cover_big?: string }[] } | null;
    const url = data?.data?.[0]?.cover_big;
    if (!url || url.includes('/artist//')) return null;
    return url;
  } catch {
    return null;
  }
}

export type DeezerAlbum = {
  id: number;
  title: string;
  cover_big: string;
  release_date?: string;
  artist: { name: string };
};

export async function searchAlbums(artist: string, query: string): Promise<DeezerAlbum[]> {
  if (!artist.trim() || !query.trim()) return [];
  try {
    const q = `artist:"${artist}" ${query}`;
    const data = await deezerProxy('album', q) as { data?: DeezerAlbum[] } | null;
    return (data?.data ?? []).slice(0, 5);
  } catch {
    return [];
  }
}

export type DeezerTrack = {
  id: number;
  title: string;
  duration: number;
  track_position?: number;
  preview: string;
  artist: { name: string };
  album: { title: string; cover_medium: string };
};

export async function searchTracks(artist: string, album: string, query: string): Promise<DeezerTrack[]> {
  if (!artist.trim() || !query.trim()) return [];
  try {
    const q = album.trim()
      ? `artist:"${artist}" album:"${album}" track:"${query}"`
      : `artist:"${artist}" track:"${query}"`;
    const data = await deezerProxy('track', q) as { data?: DeezerTrack[] } | null;
    return (data?.data ?? []).slice(0, 5);
  } catch {
    return [];
  }
}

//const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deezer-proxy`;
// async function deezerProxy(type: 'artist' | 'album', q: string): Promise<unknown> {
//   const url = `${PROXY_URL}?type=${type}&q=${encodeURIComponent(q)}`;
//   const res = await fetch(url, {
//     headers: {
//       'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
//     },
//   });
//   if (!res.ok) return null;
//   return res.json();
// }

// export async function searchArtistImage(name: string): Promise<string | null> {
//   try {
//     const data = await deezerProxy('artist', name) as { data?: { picture_big?: string }[] } | null;
//     const url = data?.data?.[0]?.picture_big;
//     if (!url || url.includes('/artist//')) return null;
//     return url;
//   } catch {
//     return null;
//   }
// }

// export async function searchAlbumCover(artist: string, album: string): Promise<string | null> {
//   try {
//     const q = `artist:"${artist}" album:"${album}"`;
//     const data = await deezerProxy('album', q) as { data?: { cover_big?: string }[] } | null;
//     const url = data?.data?.[0]?.cover_big;
//     if (!url || url.includes('/artist//')) return null;
//     return url;
//   } catch {
//     return null;
//   }
// }

// export type DeezerAlbum = {
//   id: number;
//   title: string;
//   cover_big: string;
//   release_date?: string;
//   artist: { name: string };
// };

// export async function searchAlbums(artist: string, query: string): Promise<DeezerAlbum[]> {
//   if (!artist.trim() || !query.trim()) return [];
//   try {
//     const q = `artist:"${artist}" ${query}`;
//     const data = await deezerProxy('album', q) as { data?: DeezerAlbum[] } | null;
//     return (data?.data ?? []).slice(0, 5);
//   } catch {
//     return [];
//   }
// }
