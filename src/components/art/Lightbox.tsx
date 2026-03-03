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

  const isPixelArt = artwork?.medium === 'Pixel Art';

  return (
    <AnimatePresence>
      {artwork && artwork.url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-brown/90 backdrop-blur-sm" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-11 h-11 flex items-center justify-center text-white/70 active:text-white"
            aria-label="Close"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex flex-col items-center w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative select-none w-full flex justify-center">
              <div
                className="relative"
                style={{
                  // Fill up to 88vw wide or 72vh tall, whichever is smaller
                  maxWidth: isPixelArt ? 'min(88vw, 72vh)' : 'min(88vw, 72vh)',
                  width: '100%',
                }}
              >
                <Image
                  src={artwork.url}
                  alt={artwork.title}
                  width={1200}
                  height={Math.round(1200 / artwork.aspectRatio)}
                  className="w-full h-auto rounded-xl shadow-2xl pointer-events-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    imageRendering: isPixelArt ? 'pixelated' : 'auto',
                    maxHeight: '72vh',
                    objectFit: 'contain',
                  }}
                />
                <div className="absolute bottom-3 right-3 text-white/40 text-xs font-display font-semibold select-none pointer-events-none">
                  © Scott Forsey
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-5 text-center text-white max-w-lg px-4">
              <h2 className="font-display text-xl md:text-2xl font-bold">{artwork.title}</h2>
              <p className="text-white/60 text-sm mt-1">
                {artwork.medium} · {artwork.year} · {artwork.dimensions}
              </p>
              {artwork.description && (
                <p className="text-white/50 mt-1.5 text-sm">{artwork.description}</p>
              )}
            </div>

            {/* Nav */}
            <div className="flex gap-4 mt-5">
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
