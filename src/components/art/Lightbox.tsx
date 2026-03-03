'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArtworkData } from '@/lib/types';

interface LightboxProps {
  artwork: ArtworkData | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Lightbox({ artwork, onClose, onNext, onPrevious }: LightboxProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrevious();
  }, [onClose, onNext, onPrevious]);

  useEffect(() => {
    if (!artwork) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [artwork, handleKeyDown]);

  return (
    <AnimatePresence>
      {artwork && artwork.url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-brown/85 backdrop-blur-sm" />

          {/* Close button — top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-11 h-11 flex items-center justify-center text-white/80 active:text-white"
            aria-label="Close"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Content — image + info stacked, sized to image */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative select-none">
              <Image
                src={artwork.url}
                alt={artwork.title}
                width={1200}
                height={Math.round(1200 / artwork.aspectRatio)}
                className="max-w-[90vw] max-h-[70vh] w-auto h-auto rounded-lg shadow-2xl pointer-events-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                style={{ imageRendering: artwork.medium === 'Pixel Art' ? 'pixelated' : 'auto' }}
              />
              <div className="absolute bottom-3 right-3 text-white/40 text-xs font-display font-semibold select-none pointer-events-none">
                © Scott Forsey
              </div>
            </div>

            <div className="mt-4 text-center text-white max-w-lg px-4">
              <h2 className="font-display text-xl md:text-2xl font-bold">{artwork.title}</h2>
              <p className="text-white/70 text-sm mt-1">
                {artwork.medium} · {artwork.year} · {artwork.dimensions}
              </p>
              {artwork.description && (
                <p className="text-white/60 mt-1.5 text-sm">{artwork.description}</p>
              )}
            </div>

            {/* Nav arrows */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={(e) => { e.stopPropagation(); onPrevious(); }}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white/70 active:text-white active:bg-white/20"
                aria-label="Previous"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white/70 active:text-white active:bg-white/20"
                aria-label="Next"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
