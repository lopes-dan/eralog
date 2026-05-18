const LEVEL_PHRASES: Record<number, string[]> = {
  1: [
    "You've heard three songs and think you get it.",
    "Casual listener energy. You'd skip them on shuffle.",
    "You mentioned them once at a party and moved on.",
    "They're on a playlist you forgot you made.",
  ],
  2: [
    "You've listened to their whole discography but called it 'research'.",
    "You know the deep cuts but won't admit it yet.",
    "Spotify's noticing. Your friends aren't. Yet.",
    "You've read the Wikipedia page. Twice.",
  ],
  3: [
    "You've cancelled plans to listen to an album properly.",
    "You're recommending them to strangers unprompted.",
    "You've started dressing slightly differently and blaming the weather.",
    "Your 'study playlist' is exclusively them now.",
  ],
  4: [
    "You've cried to at least one B-side.",
    "You've watched every live performance on YouTube from 2003 to present.",
    "You've explained why their 'underrated album' is actually their best.",
    "You've considered getting a related tattoo. You're still considering it.",
  ],
  5: [
    "You've rearranged your personality around this band.",
    "You're eating soup alone and calling it an aesthetic.",
    "You've started a Letterboxd review mentioning them despite it being a film.",
    "You've posted something cryptic and it's their lyrics. We know.",
    "You've told someone this band 'changed your life' and meant it.",
  ],
};

const WEEK_CONTEXTS: Array<{ weeks: number; suffix: string }> = [
  { weeks: 0, suffix: 'Day one. The obsession is just a seedling.' },
  { weeks: 1, suffix: "One week in. You think you're in control." },
  { weeks: 2, suffix: "Two weeks deep. The algorithm has noticed." },
  { weeks: 4, suffix: "A month in. This is who you are now." },
  { weeks: 8, suffix: "Two months. You've told at least four people about them." },
  { weeks: 12, suffix: "Three months. Write a thesis or move on." },
  { weeks: 26, suffix: "Six months. They're in your top artists. Obviously." },
  { weeks: 52, suffix: "A full year. You are their biographer at this point." },
];

export function generateCommentary(bandName: string, obsessionLevel: number, startDate: string): string {
  const phrases = LEVEL_PHRASES[obsessionLevel] || LEVEL_PHRASES[3];
  const phrase = phrases[Math.floor(Math.abs(bandName.charCodeAt(0) + obsessionLevel) % phrases.length)];

  const weeks = Math.floor((Date.now() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000));
  let weekContext = WEEK_CONTEXTS[0].suffix;
  for (const wc of WEEK_CONTEXTS) {
    if (weeks >= wc.weeks) weekContext = wc.suffix;
  }

  const weeksStr = weeks === 0 ? 'brand new' : weeks === 1 ? '1 week' : `${weeks} weeks`;
  const timePrefix = weeks === 0 ? '' : `${weeksStr} into ${bandName}. `;

  return `${timePrefix}${phrase} ${weekContext}`;
}

export function generatePersonalityRead(eras: Array<{ genres: string[]; band_name: string; obsession_level: number }>): string {
  const allGenres = eras.flatMap(e => e.genres.map(g => g.toLowerCase()));
  const genreCounts: Record<string, number> = {};
  for (const g of allGenres) genreCounts[g] = (genreCounts[g] || 0) + 1;

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  const avgObsession = eras.length ? eras.reduce((s, e) => s + e.obsession_level, 0) / eras.length : 0;

  const reads: Array<[string[], string]> = [
    [['post-punk', 'gothic rock', 'goth'], "Post-punk and goth heavy. You own at least one turtleneck and have opinions about Joy Division that nobody asked for."],
    [['shoegaze', 'dream pop', 'ambient'], "Shoegaze and haze. You listen to music loudest when you want to disappear. The carpet is your best friend."],
    [['metal', 'heavy metal', 'death metal', 'black metal'], "Metal runs deep here. You've explained why heaviness is actually emotional vulnerability and you're not wrong."],
    [['folk', 'folk rock', 'singer-songwriter'], "Folk and acoustic tendencies. You've sat on a porch imagining you live somewhere with seasons."],
    [['indie rock', 'alternative rock', 'indie pop'], "Indie and alternative across the board. You're building a personality one Bandcamp purchase at a time."],
    [['jazz', 'jazz fusion', 'free jazz'], "Jazz-heavy history. You've told someone music peaked in 1959 and you believe it."],
    [['electronic', 'synthpop', 'new wave'], "Synths and machines. You've referred to a song as 'glacial' without irony."],
    [['hip hop', 'rap', 'trap'], "Hip-hop runs through your eras. You have strong opinions about what counts as a classic."],
  ];

  for (const [tags, read] of reads) {
    if (topGenres.some(g => tags.some(t => g.includes(t)))) return read;
  }

  if (avgObsession >= 4) return "No dominant genre — just relentless obsession. You spiral in all directions equally. Chaotic, but committed.";
  if (eras.length > 10) return "An eclectic, wide-ranging listener with a long trail of eras. You contain multitudes. Possibly too many.";
  return "Your taste resists easy categorization. Either you're genuinely broad-minded or you haven't found your genre yet. Both are valid.";
}
