'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { WatercolorBlob } from '@/components/ui/WatercolorBlob';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-12 md:py-28">
      {/* Decorative blobs */}
      <WatercolorBlob color="#7EC8E3" size={300} className="-top-16 -left-16" />
      <WatercolorBlob color="#E84393" size={180} className="-top-8 right-4 hidden sm:block" />
      <WatercolorBlob color="#FF8C42" size={200} className="bottom-0 left-1/4" />

      <div className="relative max-w-6xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl md:text-7xl font-bold text-brown leading-tight"
        >
          Music & Art by
          <br />
          <span className="bg-gradient-to-r from-sky to-sunset bg-clip-text text-transparent">
            Scott Forsey
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center justify-center gap-3"
        >
          <Link href="/music">
            <Button size="lg">Listen Now</Button>
          </Link>
          <Link href="/art">
            <Button variant="secondary" size="lg">View Gallery</Button>
          </Link>
        </motion.div>

        {/* Floating pixel sprites — hidden on very small screens */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-12 left-[15%] hidden sm:block"
          aria-hidden
        >
          <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
            <path d="M12 2v8l-2 2H8l-2 2v-4H4l-2-2V4h4V2h2v4h2V2h2z" fill="#FF8C42" />
            <path d="M6 2h2v2H6zM10 2h2v2h-2zM6 6h6v2H6z" fill="#FFD500" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ y: [5, -5, 5] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute top-28 right-[18%] hidden sm:block"
          aria-hidden
        >
          <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="1" fill="#E84393" />
            <rect x="4" y="4" width="4" height="4" fill="#FFD500" />
            <rect x="8" y="8" width="4" height="4" fill="#7EC8E3" />
            <rect x="4" y="8" width="4" height="4" fill="#55A630" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ y: [-3, 7, -3] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
          className="absolute bottom-8 left-[22%] hidden sm:block"
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <path d="M8 0l2 5h5l-4 3 1.5 5L8 10l-4.5 3L5 8 1 5h5z" fill="#FFD500" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
