'use client';

import { TrackRow, songToTrack } from './TrackRow';
import type { SongData } from '@/lib/types';
import type { Track } from '@/lib/audio/context';

interface TrackListProps {
  songs: SongData[];
}

export function TrackList({ songs }: TrackListProps) {
  const allTracks: Track[] = songs.map(s => songToTrack(s));

  return (
    <div className="flex flex-col gap-2">
      {songs.map((song, i) => (
        <TrackRow
          key={song._id}
          song={song}
          allTracks={allTracks}
          trackIndex={i}
          index={i}
        />
      ))}
    </div>
  );
}
