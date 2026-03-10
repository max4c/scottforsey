'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { slugify } from '@/lib/slug';

export function FeaturedAlbums() {
  const featured = useQuery(api.albums.getFeatured);
  const songs = useQuery(api.songs.list);

  if (!featured || featured.length === 0 || !songs) return null;

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-pixel text-[10px] text-sky tracking-wider mb-2">COLLECTION</p>
            <h2 className="font-display text-3xl font-bold text-brown">Featured Albums</h2>
          </div>
          <Link href="/music" className="font-display font-semibold text-sky hover:text-sky-dark transition-colors">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((album, i) => {
            const albumSongs = songs?.filter(s => s.albumId === album._id) ?? [];
            return (
              <motion.div
                key={album._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/music/${slugify(album.title)}`} className="text-left group block">
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm group-active:scale-95 transition-transform">
                    {album.coverUrl ? (
                      <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full"
                        style={{ background: `linear-gradient(135deg, ${album.gradientFrom ?? '#f4a261'}, ${album.gradientTo ?? '#e76f51'})` }} />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-brown ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 font-display font-semibold text-sm text-brown truncate">{album.title}</p>
                  <p className="text-xs text-brown-lighter">{albumSongs.length} tracks</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
