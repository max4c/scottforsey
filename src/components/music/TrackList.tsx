'use client';

import { TrackRow, songToTrack } from './TrackRow';
import type { SongData } from '@/lib/types';
import type { Track } from '@/lib/audio/context';

type AlbumMeta = { coverUrl?: string | null; gradientFrom?: string; gradientTo?: string; title: string } | null | undefined;

interface TrackListProps {
  songs: SongData[];
  album?: AlbumMeta;
}

export function TrackList({ songs, album }: TrackListProps) {
  const allTracks: Track[] = songs.map(s => songToTrack(s, album));

  return (
    <div className="flex flex-col gap-2">
      {songs.map((song, i) => (
        <TrackRow
          key={song._id}
          song={song}
          allTracks={allTracks}
          trackIndex={i}
          index={i}
          album={album}
        />
      ))}
    </div>
  );
}
