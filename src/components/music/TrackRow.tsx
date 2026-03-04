'use client';

import { useAudioPlayer, Track } from '@/lib/audio/context';
import { formatDuration, SongData } from '@/lib/types';
import { motion } from 'framer-motion';

interface TrackRowProps {
  song: SongData;
  allTracks: Track[];
  trackIndex: number;
  index?: number;
}

export function songToTrack(song: SongData): Track {
  return {
    id: song._id,
    title: song.title,
    audioUrl: song.url ?? null,
    duration: song.duration,
  };
}

export function TrackRow({ song, allTracks, trackIndex, index = 0 }: TrackRowProps) {
  const { state, currentTrack, playQueue, togglePlayPause } = useAudioPlayer();
  const isCurrentTrack = currentTrack?.id === song._id;
  const isPlaying = isCurrentTrack && state === 'playing';

  function handleClick() {
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      playQueue(allTracks, trackIndex);
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left group
        ${isCurrentTrack
          ? 'bg-sunset/10 shadow-sm'
          : 'bg-white shadow-sm hover:shadow-md'
        }`}
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
      <div className="flex-1 min-w-0">
        <p className={`font-display font-semibold text-sm truncate ${isCurrentTrack ? 'text-sunset' : 'text-brown'}`}>
          {song.title}
        </p>
      </div>

      {/* Duration */}
      <span className="text-xs text-brown-lighter tabular-nums flex-shrink-0">
        {formatDuration(song.duration)}
      </span>
    </motion.button>
  );
}
