'use client';

import { useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { ArtworkCard } from '@/components/art/ArtworkCard';
import { Lightbox } from '@/components/art/Lightbox';
import type { ArtworkData } from '@/lib/types';

export function ArtGallery() {
  const artworks = useQuery(api.artworks.list);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = (artworks ?? []) as ArtworkData[];
  const lightboxArtwork = lightboxIndex !== null ? items[lightboxIndex] ?? null : null;

  const handleNext = useCallback(() => {
    setLightboxIndex(i => (i !== null && i < items.length - 1) ? i + 1 : 0);
  }, [items.length]);

  const handlePrevious = useCallback(() => {
    setLightboxIndex(i => (i !== null && i > 0) ? i - 1 : items.length - 1);
  }, [items.length]);

  if (!artworks) {
    return <p className="text-brown-lighter">Loading...</p>;
  }

  return (
    <>
      <div className="masonry-grid">
        {items.map((artwork, i) => (
          <ArtworkCard
            key={artwork._id}
            artwork={artwork}
            onClick={() => setLightboxIndex(i)}
            index={i}
          />
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-brown-lighter py-12 font-display">
          No artworks yet.
        </p>
      )}

      <Lightbox
        artwork={lightboxArtwork}
        onClose={() => setLightboxIndex(null)}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  );
}
