'use client';

import { useAudioPlayer } from '@/lib/audio/context';
import { formatDuration } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useCallback, useEffect } from 'react';

interface FullscreenPlayerProps {
  onClose: () => void;
}

function ScrubBar({ currentTime, duration, onSeek }: {
  currentTime: number;
  duration: number;
  onSeek: (t: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubPct, setScrubPct] = useState<number | null>(null);

  const pctFromX = useCallback((clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setScrubbing(true);
    setScrubPct(pctFromX(e.clientX));
    const onMove = (ev: MouseEvent) => setScrubPct(pctFromX(ev.clientX));
    const onUp = (ev: MouseEvent) => {
      onSeek(pctFromX(ev.clientX) * duration);
      setScrubbing(false);
      setScrubPct(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setScrubbing(true);
    setScrubPct(pctFromX(e.touches[0].clientX));
    const onMove = (ev: TouchEvent) => {
      ev.preventDefault();
      setScrubPct(pctFromX(ev.touches[0].clientX));
    };
    const onEnd = (ev: TouchEvent) => {
      onSeek(pctFromX(ev.changedTouches[0].clientX) * duration);
      setScrubbing(false);
      setScrubPct(null);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  const pct = scrubPct !== null ? scrubPct * 100 : duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div>
      <div
        ref={barRef}
        className="relative h-8 flex items-center cursor-pointer touch-none"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* Track background */}
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/15" />
        {/* Progress fill */}
        <div
          className="absolute left-0 h-[3px] rounded-full bg-white/90"
          style={{ width: `${pct}%` }}
        />
        {/* Thumb */}
        <motion.div
          className="absolute w-[14px] h-[14px] rounded-full bg-white"
          style={{
            left: `calc(${pct}% - 7px)`,
            boxShadow: '0 1px 6px rgba(0,0,0,0.4)',
          }}
          animate={{ scale: scrubbing ? 1.5 : 1 }}
          transition={{ duration: 0.1 }}
        />
      </div>
      {/* Time labels */}
      <div className="flex justify-between -mt-1">
        <span className="text-white/35 text-[11px] tabular-nums font-body">
          {formatDuration(currentTime)}
        </span>
        <span className="text-white/35 text-[11px] tabular-nums font-body">
          -{formatDuration(Math.max(0, duration - currentTime))}
        </span>
      </div>
    </div>
  );
}

export function FullscreenPlayer({ onClose }: FullscreenPlayerProps) {
  const {
    state, currentTrack, currentTime, duration,
    shuffle, repeat, volume, queue, queueIndex,
    togglePlayPause, next, previous, seek, setVolume,
    toggleShuffle, toggleRepeat, setShowQueue, showQueue,
  } = useAudioPlayer();

  const startYRef = useRef<number | null>(null);
  const dragRef = useRef(false);
  const [dragY, setDragY] = useState(0);

  const onTouchStartPanel = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    dragRef.current = false;
  };
  const onTouchMovePanel = (e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 8) dragRef.current = true;
    if (dragRef.current && dy > 0) setDragY(dy);
  };
  const onTouchEndPanel = () => {
    if (dragY > 90) onClose();
    setDragY(0);
    startYRef.current = null;
    dragRef.current = false;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!currentTrack) return null;

  const upNextCount = queue.length - queueIndex - 1;
  const isPlaying = state === 'playing';
  const hasCover = !!currentTrack.coverUrl;
  const gradFrom = currentTrack.gradientFrom ?? '#2d1a12';
  const gradTo = currentTrack.gradientTo ?? '#120a06';

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: dragY }}
      exit={{ y: '100%' }}
      transition={dragY > 0 ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 36 }}
      className="fixed inset-0 z-[60] flex flex-col select-none overflow-hidden"
      onTouchStart={onTouchStartPanel}
      onTouchMove={onTouchMovePanel}
      onTouchEnd={onTouchEndPanel}
    >
      {/* ── Atmospheric background ── */}
      {hasCover ? (
        <>
          <img
            key={currentTrack.id}
            src={currentTrack.coverUrl!}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-[1.2] blur-3xl brightness-[0.35] saturate-150"
          />
          {/* Gradient vignette — heavier at bottom for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80" />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(150deg, ${gradFrom} 0%, ${gradTo} 100%)` }}
          />
          <div className="absolute inset-0 bg-black/25" />
        </>
      )}

      {/* ── Content layer ── */}
      <div
        className="relative flex flex-col h-full px-6"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
      >

        {/* Top bar: close + drag handle */}
        <div className="flex items-center justify-between pt-2 pb-1 flex-shrink-0">
          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.88 }}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white/55 active:text-white active:bg-white/10"
            aria-label="Close"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
            </svg>
          </motion.button>

          <div className="w-10 h-[3px] rounded-full bg-white/20" />
          <div className="w-10" />
        </div>

        {/* ── Album Art ── */}
        <div className="flex-1 flex items-center justify-center py-3 min-h-0">
          <motion.div
            key={currentTrack.id}
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: isPlaying ? 1 : 0.9, opacity: 1 }}
            transition={{ scale: { type: 'spring', stiffness: 220, damping: 26 }, opacity: { duration: 0.25 } }}
            className="rounded-[20px] overflow-hidden flex-shrink-0"
            style={{
              width: 'min(100%, 310px)',
              aspectRatio: '1 / 1',
              boxShadow: isPlaying
                ? '0 28px 72px rgba(0,0,0,0.75), 0 8px 24px rgba(0,0,0,0.5)'
                : '0 12px 36px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            {hasCover ? (
              <img
                src={currentTrack.coverUrl!}
                alt={currentTrack.albumTitle ?? currentTrack.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
              />
            )}
          </motion.div>
        </div>

        {/* ── Track info ── */}
        <div className="flex-shrink-0 pb-4">
          <motion.h2
            key={`title-${currentTrack.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display font-bold text-white leading-tight truncate"
            style={{ fontSize: 'clamp(20px, 5.5vw, 26px)' }}
          >
            {currentTrack.title}
          </motion.h2>
          <AnimatePresence>
            {currentTrack.albumTitle && (
              <motion.p
                key={`album-${currentTrack.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.25 }}
                className="text-white/45 text-sm mt-0.5 truncate font-body"
              >
                {currentTrack.albumTitle}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ── Scrub bar ── */}
        <div className="flex-shrink-0 pb-3">
          <ScrubBar currentTime={currentTime} duration={duration} onSeek={seek} />
        </div>

        {/* ── Main controls ── */}
        <div className="flex-shrink-0 flex items-center justify-between pb-4">
          {/* Shuffle */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={toggleShuffle}
              className={`w-11 h-11 flex items-center justify-center transition-colors ${
                shuffle ? 'text-[#FF8C42]' : 'text-white/35'
              }`}
              aria-label="Shuffle"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>
            <div
              className="w-1 h-1 rounded-full transition-all duration-200"
              style={{
                opacity: shuffle ? 1 : 0,
                backgroundColor: '#FF8C42',
                transform: shuffle ? 'scale(1)' : 'scale(0)',
              }}
            />
          </div>

          {/* Previous */}
          <motion.button
            onClick={previous}
            whileTap={{ scale: 0.85 }}
            className="w-14 h-14 flex items-center justify-center text-white"
            aria-label="Previous"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </motion.button>

          {/* Play / Pause */}
          <motion.button
            onClick={togglePlayPause}
            whileTap={{ scale: 0.92 }}
            className="flex items-center justify-center rounded-full bg-white"
            style={{
              width: 74,
              height: 74,
              boxShadow: '0 6px 28px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)',
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPlaying ? (
                <motion.svg
                  key="pause"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  width="26" height="26" viewBox="0 0 24 24" fill="#1c0f08"
                >
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="play"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  width="26" height="26" viewBox="0 0 24 24" fill="#1c0f08"
                  style={{ marginLeft: 3 }}
                >
                  <path d="M8 5v14l11-7z" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Next */}
          <motion.button
            onClick={next}
            whileTap={{ scale: 0.85 }}
            className="w-14 h-14 flex items-center justify-center text-white"
            aria-label="Next"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </motion.button>

          {/* Repeat */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={toggleRepeat}
              className={`w-11 h-11 flex items-center justify-center transition-colors ${
                repeat !== 'off' ? 'text-[#FF8C42]' : 'text-white/35'
              }`}
              aria-label="Repeat"
            >
              {repeat === 'one' ? (
                <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
                </svg>
              ) : (
                <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                </svg>
              )}
            </button>
            <div
              className="w-1 h-1 rounded-full transition-all duration-200"
              style={{
                opacity: repeat !== 'off' ? 1 : 0,
                backgroundColor: '#FF8C42',
                transform: repeat !== 'off' ? 'scale(1)' : 'scale(0)',
              }}
            />
          </div>
        </div>

        {/* ── Volume + Queue ── */}
        <div
          className="flex-shrink-0 flex items-center gap-3"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 30px)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/30 flex-shrink-0">
            <path d="M7 9v6h4l5 5V4l-5 5H7z" />
          </svg>

          {/* Custom volume slider */}
          <div className="relative flex-1 h-8 flex items-center">
            <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/15" />
            <div
              className="absolute left-0 h-[3px] rounded-full"
              style={{
                width: `${volume * 100}%`,
                background: 'rgba(255,140,66,0.85)',
              }}
            />
            <input
              type="range"
              min="0" max="1" step="0.02"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer touch-none"
              aria-label="Volume"
            />
            <div
              className="absolute w-3 h-3 rounded-full bg-white pointer-events-none"
              style={{
                left: `calc(${volume * 100}% - 6px)`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}
            />
          </div>

          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/30 flex-shrink-0">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>

          <button
            onClick={() => { setShowQueue(!showQueue); onClose(); }}
            className={`relative w-10 h-10 flex items-center justify-center rounded-full ml-1 transition-colors ${
              showQueue ? 'text-[#FF8C42]' : 'text-white/35 active:text-white'
            }`}
            aria-label="Queue"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
            </svg>
            {upNextCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF8C42] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {upNextCount > 9 ? '9+' : upNextCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </motion.div>
  );
}
