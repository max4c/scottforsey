'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function FeaturedArt() {
  const featured = useQuery(api.artworks.getFeatured);

  if (!featured || featured.length === 0) return null;

  return (
    <section className="py-16 bg-cream-dark/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-pixel text-[10px] text-berry tracking-wider mb-2">GALLERY</p>
            <h2 className="font-display text-3xl font-bold text-brown">Featured Art</h2>
          </div>
          <Link href="/art" className="font-display font-semibold text-berry hover:text-berry-dark transition-colors">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((artwork, i) => (
            artwork.url && (
              <motion.div
                key={artwork._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href="/art" className="group block">
                  <div className="rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all">
                    <Image
                      src={artwork.url}
                      alt={artwork.title}
                      width={400}
                      height={Math.round(400 / artwork.aspectRatio)}
                      className="w-full h-auto"
                      style={{ imageRendering: artwork.medium === 'Pixel Art' ? 'pixelated' : 'auto' }}
                    />
                    <div className="p-3">
                      <h3 className="font-display font-semibold text-sm text-brown group-hover:text-berry transition-colors truncate">
                        {artwork.title}
                      </h3>
                      <p className="text-xs text-brown-lighter mt-0.5">{artwork.series}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
