'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TrackList } from '@/components/music/TrackList';
import { AlbumCover } from '@/components/music/AlbumCover';
import { useAudioPlayer } from '@/lib/audio/context';
import { songToTrack } from '@/components/music/TrackRow';
import { formatDuration } from '@/lib/types';
import { slugify } from '@/lib/slug';
import type { SongData, AlbumData } from '@/lib/types';
import { useState } from 'react';

function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/music/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Scott Forsey', url });
        return;
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-parchment text-brown text-xs font-semibold active:bg-parchment/70 transition-colors"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" /></svg>
          Share
        </>
      )}
    </button>
  );
}

export default function AlbumPage() {
  const { slug } = useParams<{ slug: string }>();
  const songs = useQuery(api.songs.list);
  const albums = useQuery(api.albums.list);
  const { playQueue, toggleShuffle, shuffle } = useAudioPlayer();

  if (!songs || !albums) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-brown-lighter">Loading...</p>
      </div>
    );
  }

  const album = (albums as AlbumData[]).find(a => slugify(a.title) === slug);

  if (!album) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-brown-lighter mb-4">Album not found.</p>
        <Link href="/music" className="text-sunset text-sm">← Back to Music</Link>
      </div>
    );
  }

  const albumSongs = (songs as SongData[])
    .filter(s => s.albumId === album._id)
    .sort((a, b) => a.order - b.order);
  const albumDuration = albumSongs.reduce((acc, s) => acc + s.duration, 0);

  function handlePlay() {
    const tracks = albumSongs.map(s => songToTrack(s, album));
    if (shuffle) toggleShuffle();
    playQueue(tracks, 0);
  }

  function handleShuffle() {
    const tracks = albumSongs.map(s => songToTrack(s, album));
    if (!shuffle) toggleShuffle();
    playQueue(tracks, 0);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/music"
        className="inline-flex items-center gap-1.5 text-sm text-brown-lighter hover:text-brown transition-colors mb-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
        All music
      </Link>

      <div className="flex items-center gap-5 mb-8">
        <AlbumCover
          coverUrl={album.coverUrl}
          gradientFrom={album.gradientFrom}
          gradientTo={album.gradientTo}
          title={album.title}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <p className="font-pixel text-[10px] text-sunset tracking-wider mb-1">ALBUM</p>
          <h1 className="font-display font-bold text-brown text-2xl md:text-3xl truncate">{album.title}</h1>
          {album.description && (
            <p className="text-brown-light text-sm mt-1">{album.description}</p>
          )}
          <p className="text-brown-lighter text-xs mt-1">
            {albumSongs.length} tracks · {formatDuration(albumDuration)}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handlePlay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sunset text-white text-xs font-semibold active:bg-sunset/80"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Play
            </button>
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-parchment text-brown text-xs font-semibold active:bg-parchment/70"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
              Shuffle
            </button>
            <ShareButton slug={slug} />
          </div>
        </div>
      </div>

      <TrackList songs={albumSongs} album={album} />
    </div>
  );
}
