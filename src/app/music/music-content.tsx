'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { TrackList } from '@/components/music/TrackList';
import { useAudioPlayer } from '@/lib/audio/context';
import { songToTrack } from '@/components/music/TrackRow';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/types';
import type { SongData, AlbumData } from '@/lib/types';

export function MusicPageContent() {
  const songs = useQuery(api.songs.list);
  const albums = useQuery(api.albums.list);
  const { playQueue, toggleShuffle, shuffle } = useAudioPlayer();

  if (!songs || !albums) {
    return <p className="text-brown-lighter">Loading...</p>;
  }

  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0);

  function handlePlayAll() {
    const tracks = (songs as SongData[]).map(s => songToTrack(s));
    if (shuffle) toggleShuffle(); // ensure shuffle is off for Play All
    playQueue(tracks, 0);
  }

  function handleShuffle() {
    const tracks = (songs as SongData[]).map(s => songToTrack(s));
    if (!shuffle) toggleShuffle();
    playQueue(tracks, 0);
  }

  function handlePlayAlbum(albumId: string) {
    const albumSongs = (songs as SongData[])
      .filter(s => s.albumId === albumId)
      .sort((a, b) => a.order - b.order);
    playQueue(albumSongs.map(s => songToTrack(s)), 0);
  }

  // Songs not in any album
  const unassignedSongs = (songs as SongData[]).filter(s => !s.albumId);

  if (albums.length === 0) {
    // No albums — flat list view
    return (
      <>
        <p className="text-brown-light mb-6">
          {songs.length} tracks · {formatDuration(totalDuration)} total
        </p>
        <div className="mb-6 flex gap-3">
          <Button onClick={handlePlayAll}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play All
          </Button>
          <Button onClick={handleShuffle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
            Shuffle
          </Button>
        </div>
        <TrackList songs={songs as SongData[]} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-brown-light">
          {songs.length} tracks · {formatDuration(totalDuration)} total
        </p>
        <div className="flex gap-3">
          <Button onClick={handlePlayAll}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play All
          </Button>
          <Button onClick={handleShuffle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
            Shuffle
          </Button>
        </div>
      </div>

      {/* Albums */}
      <div className="space-y-10">
        {(albums as AlbumData[]).map((album) => {
          const albumSongs = (songs as SongData[])
            .filter(s => s.albumId === album._id)
            .sort((a, b) => a.order - b.order);
          if (albumSongs.length === 0) return null;
          const albumDuration = albumSongs.reduce((acc, s) => acc + s.duration, 0);

          return (
            <section key={album._id}>
              <div className="flex items-center gap-4 mb-4">
                {album.coverUrl && (
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-display font-bold text-brown text-lg">{album.title}</h2>
                  {album.description && (
                    <p className="text-brown-light text-sm">{album.description}</p>
                  )}
                  <p className="text-brown-lighter text-xs mt-0.5">
                    {albumSongs.length} tracks · {formatDuration(albumDuration)}
                  </p>
                </div>
                <button
                  onClick={() => handlePlayAlbum(album._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sunset text-white text-sm font-semibold active:bg-sunset/80 flex-shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play
                </button>
              </div>
              <TrackList songs={albumSongs} />
            </section>
          );
        })}

        {/* Unassigned songs */}
        {unassignedSongs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-brown text-lg">Other Tracks</h2>
            </div>
            <TrackList songs={unassignedSongs} />
          </section>
        )}
      </div>
    </>
  );
}
