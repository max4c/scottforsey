'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { ArtworkData } from '@/lib/types';

interface ArtworkCardProps {
  artwork: ArtworkData;
  onClick: () => void;
  index?: number;
}

export function ArtworkCard({ artwork, onClick, index = 0 }: ArtworkCardProps) {
  if (!artwork.url) return null;

  return (
    <motion.div
      className="masonry-item"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={onClick}
        className="w-full text-left group cursor-pointer"
      >
        <div className="rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-all">
          <div className="w-full relative">
            <Image
              src={artwork.url}
              alt={artwork.title}
              width={800}
              height={Math.round(800 / artwork.aspectRatio)}
              className="w-full h-auto"
              style={{ imageRendering: artwork.medium === 'Pixel Art' ? 'pixelated' : 'auto' }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
              <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-display font-semibold text-sm text-brown group-hover:text-berry transition-colors">
              {artwork.title}
            </h3>
            <p className="text-xs text-brown-lighter mt-0.5">
              {artwork.medium} · {artwork.year}
            </p>
          </div>
        </div>
      </button>
    </motion.div>
  );
}
