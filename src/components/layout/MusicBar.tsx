'use client';

import { useAudioPlayer } from '@/lib/audio/context';
import { formatDuration } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';

function ScrubBar({ currentTime, duration, onSeek }: {
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubPct, setScrubPct] = useState<number | null>(null);

  const pctFromEvent = useCallback((clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  // Mouse
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setScrubbing(true);
    setScrubPct(pctFromEvent(e.clientX));

    const onMove = (e: MouseEvent) => setScrubPct(pctFromEvent(e.clientX));
    const onUp = (e: MouseEvent) => {
      const pct = pctFromEvent(e.clientX);
      onSeek(pct * duration);
      setScrubbing(false);
      setScrubPct(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Touch
  const onTouchStart = (e: React.TouchEvent) => {
    setScrubbing(true);
    setScrubPct(pctFromEvent(e.touches[0].clientX));

    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      setScrubPct(pctFromEvent(e.touches[0].clientX));
    };
    const onEnd = (e: TouchEvent) => {
      const pct = pctFromEvent(e.changedTouches[0].clientX);
      onSeek(pct * duration);
      setScrubbing(false);
      setScrubPct(null);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  const displayPct = scrubPct !== null
    ? scrubPct * 100
    : duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={barRef}
      className="relative h-4 flex items-center cursor-pointer group touch-none"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Track */}
      <div className="absolute inset-x-0 h-1.5 rounded-full bg-parchment">
        <div
          className={`h-full rounded-full transition-[width] ${scrubbing ? '' : 'duration-200'} ${scrubbing ? 'bg-berry' : 'bg-sunset group-hover:bg-berry'}`}
          style={{ width: `${displayPct}%` }}
        />
      </div>
      {/* Thumb */}
      <div
        className={`absolute w-3 h-3 rounded-full bg-sunset shadow transition-transform ${scrubbing ? 'scale-125 bg-berry' : 'scale-0 group-hover:scale-100'}`}
        style={{ left: `calc(${displayPct}% - 6px)` }}
      />
    </div>
  );
}

export function MusicBar() {
  const {
    state,
    currentTrack,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = useAudioPlayer();

  if (state === 'idle' || !currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="musicbar"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-brown/10 shadow-lg"
      >
        {/* Scrub bar */}
        <div className="px-3 pt-2">
          <ScrubBar currentTime={currentTime} duration={duration} onSeek={seek} />
        </div>

        <div className="max-w-6xl mx-auto px-3 h-14 flex items-center gap-2">
          {/* Track info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded flex-shrink-0 bg-gradient-to-br from-sky via-sunset to-berry" />
            <div className="min-w-0">
              <p className="font-display font-semibold text-sm text-brown truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-brown-lighter tabular-nums">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </p>
            </div>
          </div>

          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
              shuffle ? 'text-sunset' : 'text-brown-lighter active:text-brown'
            }`}
            aria-label="Shuffle"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>

          {/* Controls */}
          <div className="flex items-center">
            <button onClick={previous} className="w-11 h-11 flex items-center justify-center text-brown-light active:text-brown" aria-label="Previous">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              onClick={togglePlayPause}
              className="w-11 h-11 flex items-center justify-center bg-sunset text-white rounded-full active:bg-sunset/80"
              aria-label={state === 'playing' ? 'Pause' : 'Play'}
            >
              {state === 'playing' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button onClick={next} className="w-11 h-11 flex items-center justify-center text-brown-light active:text-brown" aria-label="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
              repeat !== 'off' ? 'text-sunset' : 'text-brown-lighter active:text-brown'
            }`}
            aria-label={repeat === 'off' ? 'Repeat off' : repeat === 'all' ? 'Repeat all' : 'Repeat one'}
          >
            {repeat === 'one' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            )}
          </button>

          {/* Volume — desktop only */}
          <div className="hidden md:flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brown-lighter flex-shrink-0">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              {volume > 0 && <path d="M15.54 8.46a5 5 0 010 7.07" />}
              {volume > 0.5 && <path d="M19.07 4.93a10 10 0 010 14.14" />}
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-sunset"
              aria-label="Volume"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
