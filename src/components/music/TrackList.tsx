'use client';

import { TrackRow, songToTrack } from './TrackRow';
import type { SongData, AlbumData } from '@/lib/types';
import type { Track } from '@/lib/audio/context';

type AlbumMeta = { coverUrl?: string | null; gradientFrom?: string; gradientTo?: string; title: string } | null | undefined;

interface TrackListProps {
  songs: SongData[];
  album?: AlbumMeta;
  albumMap?: Map<string, AlbumData>;
}

export function TrackList({ songs, album, albumMap }: TrackListProps) {
  function getAlbum(song: SongData): AlbumMeta {
    if (album) return album;
    if (albumMap && song.albumId) return albumMap.get(song.albumId) ?? undefined;
    return undefined;
  }

  const resolved = songs.map(s => ({ song: s, album: getAlbum(s) }));
  const allTracks: Track[] = resolved.map(({ song, album }) => songToTrack(song, album));

  return (
    <div className="flex flex-col gap-2">
      {resolved.map(({ song, album }, i) => (
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
