'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { audioPlayer, Track, PlayerState, RepeatMode } from './player';

interface AudioContextValue {
  state: PlayerState;
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  showQueue: boolean;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  playAt: (index: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setShowQueue: (v: boolean) => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [, forceUpdate] = useState(0);
  const [showQueue, setShowQueue] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const unsub = audioPlayer.subscribe(() => {
      if (mounted.current) forceUpdate(n => n + 1);
    });
    return () => {
      mounted.current = false;
      unsub();
    };
  }, []);

  const play = useCallback((track: Track) => audioPlayer.play(track), []);
  const pause = useCallback(() => audioPlayer.pause(), []);
  const resume = useCallback(() => audioPlayer.resume(), []);
  const togglePlayPause = useCallback(() => audioPlayer.togglePlayPause(), []);
  const next = useCallback(() => audioPlayer.next(), []);
  const previous = useCallback(() => audioPlayer.previous(), []);
  const seek = useCallback((time: number) => audioPlayer.seek(time), []);
  const setVolume = useCallback((vol: number) => audioPlayer.setVolume(vol), []);
  const playQueue = useCallback((tracks: Track[], startIndex?: number) => audioPlayer.playQueue(tracks, startIndex), []);
  const addToQueue = useCallback((track: Track) => audioPlayer.addToQueue(track), []);
  const playNext = useCallback((track: Track) => audioPlayer.playNext(track), []);
  const removeFromQueue = useCallback((index: number) => audioPlayer.removeFromQueue(index), []);
  const playAt = useCallback((index: number) => audioPlayer.playAt(index), []);
  const clearQueue = useCallback(() => audioPlayer.clearQueue(), []);
  const toggleShuffle = useCallback(() => audioPlayer.toggleShuffle(), []);
  const toggleRepeat = useCallback(() => audioPlayer.toggleRepeat(), []);

  const value: AudioContextValue = {
    state: audioPlayer.state,
    currentTrack: audioPlayer.currentTrack,
    queue: audioPlayer.queue,
    queueIndex: audioPlayer.queueIndex,
    currentTime: audioPlayer.currentTime,
    duration: audioPlayer.duration,
    volume: audioPlayer.volume,
    shuffle: audioPlayer.shuffle,
    repeat: audioPlayer.repeat,
    showQueue,
    play,
    pause,
    resume,
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume,
    playQueue,
    addToQueue,
    playNext,
    removeFromQueue,
    playAt,
    clearQueue,
    toggleShuffle,
    toggleRepeat,
    setShowQueue,
  };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudioPlayer() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioProvider');
  return ctx;
}

export type { Track };
