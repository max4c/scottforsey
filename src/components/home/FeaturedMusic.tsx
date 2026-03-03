'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAudioPlayer } from '@/lib/audio/context';
import { songToTrack } from '@/components/music/TrackRow';
import { formatDuration, SongData } from '@/lib/types';
import type { Track } from '@/lib/audio/context';

export function FeaturedMusic() {
  const featured = useQuery(api.songs.getFeatured);
  const { state, currentTrack, play, togglePlayPause } = useAudioPlayer();

  if (!featured || featured.length === 0) return null;

  function handlePlay(song: SongData) {
    const track: Track = songToTrack(song);
    if (currentTrack?.id === song._id) {
      togglePlayPause();
    } else {
      play(track);
    }
  }

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-pixel text-[10px] text-sunset tracking-wider mb-2">NOW PLAYING</p>
            <h2 className="font-display text-3xl font-bold text-brown">Featured Tracks</h2>
          </div>
          <Link href="/music" className="font-display font-semibold text-sky hover:text-sky-dark transition-colors">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((song, i) => {
            const isCurrentTrack = currentTrack?.id === song._id;
            const isPlaying = isCurrentTrack && state === 'playing';

            return (
              <motion.button
                key={song._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handlePlay(song as SongData)}
                className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-all text-left group"
              >
                <div className="w-14 h-14 rounded flex-shrink-0 relative bg-gradient-to-br from-sky via-sunset to-berry">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <motion.div animate={{ height: ['40%', '100%', '40%'] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white rounded-full" />
                        <motion.div animate={{ height: ['70%', '30%', '70%'] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-white rounded-full" />
                        <motion.div animate={{ height: ['50%', '80%', '50%'] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-white rounded-full" />
                      </div>
                    ) : (
                      <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`font-display font-semibold truncate ${isCurrentTrack ? 'text-sunset' : 'text-brown'}`}>
                    {song.title}
                  </p>
                </div>

                <span className="text-xs text-brown-lighter tabular-nums">
                  {formatDuration(song.duration)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
