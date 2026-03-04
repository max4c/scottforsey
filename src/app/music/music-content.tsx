'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { TrackList } from '@/components/music/TrackList';
import { AlbumCover } from '@/components/music/AlbumCover';
import { useAudioPlayer } from '@/lib/audio/context';
import { songToTrack } from '@/components/music/TrackRow';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/types';
import type { SongData, AlbumData } from '@/lib/types';
import { useState, useMemo } from 'react';

export function MusicPageContent() {
  const songs = useQuery(api.songs.list);
  const albums = useQuery(api.albums.list);
  const { playQueue, toggleShuffle, shuffle } = useAudioPlayer();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  if (!songs || !albums) {
    return <p className="text-brown-lighter">Loading...</p>;
  }

  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0);

  function handlePlayAll() {
    const tracks = (songs as SongData[]).map(s => songToTrack(s));
    if (shuffle) toggleShuffle();
    playQueue(tracks, 0);
  }

  function handleShuffle() {
    const tracks = (songs as SongData[]).map(s => songToTrack(s));
    if (!shuffle) toggleShuffle();
    playQueue(tracks, 0);
  }

  // No albums — flat list
  if (albums.length === 0) {
    return (
      <>
        <p className="text-brown-light mb-6">{songs.length} tracks · {formatDuration(totalDuration)} total</p>
        <div className="mb-6 flex gap-3">
          <Button onClick={handlePlayAll}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M8 5v14l11-7z" /></svg>
            Play All
          </Button>
          <Button onClick={handleShuffle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
            Shuffle
          </Button>
        </div>
        <TrackList songs={songs as SongData[]} />
      </>
    );
  }

  // Album detail view
  if (selectedAlbumId) {
    const album = (albums as AlbumData[]).find(a => a._id === selectedAlbumId);
    const albumSongs = (songs as SongData[])
      .filter(s => s.albumId === selectedAlbumId)
      .sort((a, b) => a.order - b.order);
    const albumDuration = albumSongs.reduce((acc, s) => acc + s.duration, 0);

    return (
      <>
        <button
          onClick={() => setSelectedAlbumId(null)}
          className="flex items-center gap-1.5 text-sm text-brown-lighter active:text-brown mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
          All albums
        </button>

        {album && (
          <div className="flex items-center gap-4 mb-6">
            <AlbumCover
              coverUrl={album.coverUrl}
              gradientFrom={album.gradientFrom}
              gradientTo={album.gradientTo}
              title={album.title}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-brown text-xl truncate">{album.title}</h2>
              {album.description && <p className="text-brown-light text-sm truncate">{album.description}</p>}
              <p className="text-brown-lighter text-xs mt-0.5">
                {albumSongs.length} tracks · {formatDuration(albumDuration)}
              </p>
            </div>
            <button
              onClick={() => { const tracks = albumSongs.map(s => songToTrack(s)); playQueue(tracks, 0); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-sunset text-white text-sm font-semibold active:bg-sunset/80 flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Play
            </button>
          </div>
        )}

        <TrackList songs={albumSongs} />
      </>
    );
  }

  const filteredSongs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? (songs as SongData[]).filter(s => s.title.toLowerCase().includes(q))
      : (songs as SongData[]);
  }, [songs, search]);

  // Grid view
  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-3">
        <p className="text-brown-light text-sm whitespace-nowrap">{songs.length} tracks · {formatDuration(totalDuration)}</p>
        <div className="flex gap-2 flex-shrink-0">
          <Button onClick={handlePlayAll} size="sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="sm:mr-1.5"><path d="M8 5v14l11-7z" /></svg>
            <span className="hidden sm:inline">Play All</span>
          </Button>
          <Button onClick={handleShuffle} size="sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="sm:mr-1.5"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
            <span className="hidden sm:inline">Shuffle</span>
          </Button>
        </div>
      </div>

      {/* Album grid */}
      {albums.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
          {(albums as AlbumData[]).map((album) => {
            const albumSongs = (songs as SongData[]).filter(s => s.albumId === album._id);
            if (albumSongs.length === 0) return null;
            return (
              <button key={album._id} onClick={() => setSelectedAlbumId(album._id)} className="text-left group">
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm group-active:scale-95 transition-transform">
                  {album.coverUrl ? (
                    <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full"
                      style={{ background: `linear-gradient(135deg, ${album.gradientFrom ?? '#f4a261'}, ${album.gradientTo ?? '#e76f51'})` }} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-brown ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
                <p className="mt-2 font-display font-semibold text-sm text-brown truncate">{album.title}</p>
                <p className="text-xs text-brown-lighter">{albumSongs.length} tracks</p>
              </button>
            );
          })}
        </div>
      )}

      {/* All Tracks */}
      <div>
        <h2 className="font-display font-bold text-brown text-lg mb-3">All Tracks</h2>
        <div className="relative mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-lighter pointer-events-none">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-brown/20 bg-white text-brown text-sm focus:outline-none focus:border-sunset"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-lighter active:text-brown"
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
        </div>
        {filteredSongs.length === 0 ? (
          <p className="text-sm text-brown-lighter text-center py-8">No songs match "{search}"</p>
        ) : (
          <TrackList songs={filteredSongs} />
        )}
      </div>
    </>
  );
}
