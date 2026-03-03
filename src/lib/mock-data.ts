export interface Song {
  id: string;
  title: string;
  duration: number;
  trackNumber: number;
  audioUrl: string | null;
  featured: boolean;
  playCount: number;
  downloadable: boolean;
}

export interface Artwork {
  id: string;
  title: string;
  imageUrl: string;
  medium: string;
  year: number;
  dimensions: string;
  series: string;
  featured: boolean;
  aspectRatio: number;
  isVisible: boolean;
  description?: string;
}

export const mockSongs: Song[] = [
  { id: "s1", title: "Adrift in Perpetuity", duration: 108, trackNumber: 1, audioUrl: "/music/adrift-in-perpetuity.m4a", featured: true, playCount: 0, downloadable: true },
  { id: "s2", title: "A Taste of the Groove", duration: 70, trackNumber: 2, audioUrl: "/music/a-taste-of-the-groove.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s3", title: "Awaiting Revenance", duration: 77, trackNumber: 3, audioUrl: "/music/awaiting-revenance.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s4", title: "Beginning Anew", duration: 181, trackNumber: 4, audioUrl: "/music/beginning-anew.m4a", featured: true, playCount: 0, downloadable: true },
  { id: "s5", title: "Cast of the Pale Moon's Light", duration: 127, trackNumber: 5, audioUrl: "/music/cast-of-the-pale-moons-light.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s6", title: "I'm Like, Just a Pirate", duration: 219, trackNumber: 6, audioUrl: "/music/im-like-just-a-pirate.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s7", title: "I'm Sorry", duration: 157, trackNumber: 7, audioUrl: "/music/im-sorry.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s8", title: "Misguided Notions", duration: 30, trackNumber: 8, audioUrl: "/music/misguided-notions.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s9", title: "My Song 3", duration: 50, trackNumber: 9, audioUrl: "/music/my-song-3.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s10", title: "My Song 27", duration: 144, trackNumber: 10, audioUrl: "/music/my-song-27.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s11", title: "Nothing In Return", duration: 115, trackNumber: 11, audioUrl: "/music/nothing-in-return.m4a", featured: true, playCount: 0, downloadable: true },
  { id: "s12", title: "Periodic Shift", duration: 99, trackNumber: 12, audioUrl: "/music/periodic-shift.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s13", title: "Permanence & Impermanence", duration: 217, trackNumber: 13, audioUrl: "/music/permanence-and-impermanence.m4a", featured: true, playCount: 0, downloadable: true },
  { id: "s14", title: "Phase One", duration: 46, trackNumber: 14, audioUrl: "/music/phase-one.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s15", title: "Prey", duration: 70, trackNumber: 15, audioUrl: "/music/prey.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s16", title: "Riders of Rohan (Retro)", duration: 75, trackNumber: 16, audioUrl: "/music/riders-of-rohan-retro.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s17", title: "RunPod Audio Signature 4", duration: 13, trackNumber: 17, audioUrl: "/music/runpod-4-audio-signature.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s18", title: "RunPod Audio Signature 5", duration: 13, trackNumber: 18, audioUrl: "/music/runpod-5-audio-signature.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s19", title: "RunPod Audio Signature Demos", duration: 27, trackNumber: 19, audioUrl: "/music/runpod-audio-signature-demos.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s20", title: "Serenity", duration: 73, trackNumber: 20, audioUrl: "/music/serenity.m4a", featured: true, playCount: 0, downloadable: true },
  { id: "s21", title: "Skipping Stones", duration: 105, trackNumber: 21, audioUrl: "/music/skipping-stones.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s22", title: "Temple of Ruins", duration: 218, trackNumber: 22, audioUrl: "/music/temple-of-ruins.m4a", featured: true, playCount: 0, downloadable: true },
  { id: "s23", title: "Those That Were", duration: 189, trackNumber: 23, audioUrl: "/music/those-that-were.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s24", title: "Torn Tape", duration: 96, trackNumber: 24, audioUrl: "/music/torn-tape.m4a", featured: false, playCount: 0, downloadable: true },
  { id: "s25", title: "Wandering Merchant", duration: 166, trackNumber: 25, audioUrl: "/music/wandering-merchant.m4a", featured: true, playCount: 0, downloadable: true },
];

export const mockArtworks: Artwork[] = [
  { id: "a1", title: "Adventure Time 16x16", imageUrl: "/art/adventure-time-pixel-characters.png", medium: "Pixel Art", year: 2024, dimensions: "426×537", series: "Pixel Art", featured: true, aspectRatio: 426 / 537, isVisible: true, description: "16x16 pixel character sheet featuring the cast of Adventure Time." },
];

export function getFeaturedSongs(): Song[] {
  return mockSongs.filter(s => s.featured);
}

export function getFeaturedArtworks(): Artwork[] {
  return mockArtworks.filter(a => a.featured);
}

export function formatDuration(seconds: number): string {
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
