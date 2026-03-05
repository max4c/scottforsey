// Shapes returned by Convex queries — used by components

export interface AlbumData {
  _id: string;
  title: string;
  description?: string;
  coverUrl: string | null;
  gradientFrom?: string;
  gradientTo?: string;
  order: number;
  isVisible: boolean;
  albumType?: 'album' | 'draft';
}

export interface SongData {
  _id: string;
  _creationTime?: number;
  title: string;
  url: string | null;
  duration: number;
  featured: boolean;
  order: number;
  albumId?: string;
}

export interface ArtworkData {
  _id: string;
  title: string;
  url: string | null;
  medium: string;
  year: number;
  dimensions: string;
  series: string;
  featured: boolean;
  aspectRatio: number;
  description?: string;
}

export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
