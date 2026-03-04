'use client';

import { useAudioPlayer } from '@/lib/audio/context';
import { formatDuration } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

export function QueuePanel() {
  const { showQueue, setShowQueue, queue, queueIndex, currentTrack, playAt, removeFromQueue, clearQueue } = useAudioPlayer();

  const upNext = queue.slice(queueIndex + 1);
  const upNextStartIndex = queueIndex + 1;

  return (
    <AnimatePresence>
      {showQueue && (
        <>
          {/* Backdrop */}
          <motion.div
            key="queue-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQueue(false)}
            className="fixed inset-0 bg-black/30 z-30"
          />

          {/* Panel */}
          <motion.div
            key="queue-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed left-0 right-0 bottom-20 z-40 mx-auto max-w-2xl px-2"
            style={{ maxHeight: 'calc(70vh)' }}
          >
            <div className="bg-white dark:bg-[#162040] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: 'calc(70vh)' }}>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-brown/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-sunset">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                  <span className="font-display font-bold text-brown text-base">Queue</span>
                  {queue.length > 0 && (
                    <span className="text-xs text-brown-lighter bg-parchment/60 px-1.5 py-0.5 rounded-full">
                      {queue.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {upNext.length > 0 && (
                    <button
                      onClick={clearQueue}
                      className="text-xs text-brown-lighter hover:text-berry transition-colors px-2 py-1 rounded-lg hover:bg-parchment/40"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setShowQueue(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-brown-lighter hover:text-brown hover:bg-parchment/60 transition-colors"
                    aria-label="Close queue"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                {/* Now Playing */}
                {currentTrack && (
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-[10px] font-semibold text-brown-lighter uppercase tracking-widest mb-2">Now Playing</p>
                    <div className="flex items-center gap-3 bg-sunset/10 rounded-xl px-3 py-2.5">
                      <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
                        <motion.div animate={{ height: ['40%', '100%', '40%'] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-sunset rounded-full" />
                        <motion.div animate={{ height: ['70%', '30%', '70%'] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-0.5 bg-sunset rounded-full" />
                        <motion.div animate={{ height: ['50%', '80%', '50%'] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-0.5 bg-sunset rounded-full" />
                      </div>
                      <p className="font-display font-semibold text-sm text-sunset flex-1 min-w-0 truncate">
                        {currentTrack.title}
                      </p>
                      <span className="text-xs text-brown-lighter tabular-nums flex-shrink-0">
                        {formatDuration(currentTrack.duration)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Up Next */}
                {upNext.length > 0 ? (
                  <div className="px-4 pt-2 pb-3">
                    <p className="text-[10px] font-semibold text-brown-lighter uppercase tracking-widest mb-2">
                      Up Next · {upNext.length}
                    </p>
                    <div className="flex flex-col gap-1">
                      {upNext.map((track, i) => {
                        const qIdx = upNextStartIndex + i;
                        return (
                          <div key={`${track.id}-${qIdx}`} className="flex items-center gap-2 group">
                            <button
                              onClick={() => playAt(qIdx)}
                              className="flex items-center gap-2.5 flex-1 min-w-0 px-3 py-2 rounded-xl hover:bg-parchment/60 transition-colors text-left"
                            >
                              <span className="text-xs text-brown-lighter tabular-nums w-4 flex-shrink-0">{i + 1}</span>
                              <span className="font-display font-semibold text-sm text-brown flex-1 min-w-0 truncate">
                                {track.title}
                              </span>
                              <span className="text-xs text-brown-lighter tabular-nums flex-shrink-0">
                                {formatDuration(track.duration)}
                              </span>
                            </button>
                            <button
                              onClick={() => removeFromQueue(qIdx)}
                              className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-brown-lighter hover:text-berry hover:bg-berry/10 transition-colors"
                              aria-label="Remove from queue"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  !currentTrack && (
                    <p className="text-sm text-brown-lighter text-center py-8">Queue is empty</p>
                  )
                )}

                {upNext.length === 0 && currentTrack && (
                  <p className="text-xs text-brown-lighter text-center pb-4">Nothing else queued</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
