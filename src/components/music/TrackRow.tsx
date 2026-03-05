'use client';

import { useAudioPlayer, Track } from '@/lib/audio/context';
import { formatDuration, SongData } from '@/lib/types';
import { slugify } from '@/lib/slug';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

type AlbumMeta = { coverUrl?: string | null; gradientFrom?: string; gradientTo?: string; title: string } | null | undefined;

interface TrackRowProps {
  song: SongData;
  allTracks: Track[];
  trackIndex: number;
  index?: number;
  album?: AlbumMeta;
}

export function songToTrack(song: SongData, album?: AlbumMeta): Track {
  return {
    id: song._id,
    title: song.title,
    audioUrl: song.url ?? null,
    duration: song.duration,
    coverUrl: album?.coverUrl ?? null,
    gradientFrom: album?.gradientFrom,
    gradientTo: album?.gradientTo,
    albumTitle: album?.title,
  };
}

export function TrackRow({ song, allTracks, trackIndex, index = 0, album }: TrackRowProps) {
  const { state, currentTrack, play, playQueue, togglePlayPause, addToQueue, playNext } = useAudioPlayer();
  const isCurrentTrack = currentTrack?.id === song._id;
  const isPlaying = isCurrentTrack && (state === 'playing' || state === 'loading');
  const isNew = song._creationTime != null && Date.now() - song._creationTime < 30 * 24 * 60 * 60 * 1000;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const track = songToTrack(song, album);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    const id = requestAnimationFrame(() => {
      document.addEventListener('mousedown', onClickOutside);
      document.addEventListener('touchstart', onClickOutside);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('touchstart', onClickOutside);
    };
  }, [menuOpen]);

  function handleRowClick() {
    if (isCurrentTrack) togglePlayPause();
    else playQueue(allTracks, trackIndex);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group
        ${isCurrentTrack ? 'bg-sunset/10 shadow-sm' : 'bg-white dark:bg-[#162040] shadow-sm hover:shadow-md'}`}
    >
      {/* Clickable play area */}
      <button
        onClick={handleRowClick}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        aria-label={isPlaying ? 'Pause' : `Play ${song.title}`}
      >
        {/* Play indicator */}
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-parchment/60 group-hover:bg-sunset/20 transition-colors">
          {isPlaying ? (
            <div className="flex items-end justify-center gap-0.5 h-3">
              <motion.div animate={{ height: ['40%', '100%', '40%'] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-sunset rounded-full" />
              <motion.div animate={{ height: ['70%', '30%', '70%'] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-0.5 bg-sunset rounded-full" />
              <motion.div animate={{ height: ['50%', '80%', '50%'] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-0.5 bg-sunset rounded-full" />
            </div>
          ) : (
            <svg className="text-brown-lighter group-hover:text-sunset transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0 flex items-center gap-2 min-w-0">
          <p className={`font-display font-semibold text-sm truncate ${isCurrentTrack ? 'text-sunset' : 'text-brown'}`}>
            {song.title}
          </p>
          {isNew && (
            <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky/20 text-sky-dark dark:text-sky leading-none">
              NEW
            </span>
          )}
        </div>

        {/* Duration */}
        <span className="text-xs text-brown-lighter tabular-nums flex-shrink-0 mr-1">
          {formatDuration(song.duration)}
        </span>
      </button>

      {/* Kebab menu */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-brown-lighter hover:text-brown hover:bg-parchment/60 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
          aria-label="Track options"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 bottom-full mb-1 w-40 bg-white dark:bg-[#1E2D52] rounded-xl shadow-lg border border-brown/10 overflow-hidden z-20 py-1">
            <button
              onClick={() => { playQueue(allTracks, trackIndex); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brown hover:bg-parchment/60 transition-colors text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-sunset flex-shrink-0"><path d="M8 5v14l11-7z" /></svg>
              Play now
            </button>
            <button
              onClick={() => { playNext(track); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brown hover:bg-parchment/60 transition-colors text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-sky flex-shrink-0"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" /></svg>
              Play next
            </button>
            <button
              onClick={() => { addToQueue(track); setMenuOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brown hover:bg-parchment/60 transition-colors text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-grass flex-shrink-0"><path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
              Add to queue
            </button>
            <button
              onClick={() => {
                const songSlug = slugify(song.title);
                const base = album ? `/music/${slugify(album.title)}` : '/music';
                const url = `${window.location.origin}${base}?track=${songSlug}`;
                if (navigator.share) {
                  navigator.share({ title: song.title, url }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(url);
                }
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brown hover:bg-parchment/60 transition-colors text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-brown-lighter flex-shrink-0"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" /></svg>
              Share song
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
