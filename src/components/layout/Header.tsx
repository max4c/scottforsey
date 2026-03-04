'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/music', label: 'Music' },
  { href: '/art', label: 'Art' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const settings = useQuery(api.siteSettings.get);
  const profileImageUrl = settings?.profileImageUrl ?? '/lucas.jpg';

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-sm border-b border-parchment">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src={profileImageUrl} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover" unoptimized />
          <span className="font-display text-lg font-bold text-brown group-hover:text-sunset transition-colors">
            Scott Forsey
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-3 py-2 rounded-lg font-display font-medium transition-colors
                    ${isActive
                      ? 'bg-parchment text-brown'
                      : 'text-brown-light hover:text-brown hover:bg-parchment/50'
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile menu toggle — 44px touch target */}
        <button
          className="md:hidden w-11 h-11 flex items-center justify-center text-brown -mr-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-b border-parchment"
          >
            <ul className="px-4 py-2 space-y-1">
              {navLinks.map(link => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg font-display font-medium text-base transition-colors
                        ${isActive ? 'bg-parchment text-brown' : 'text-brown-light'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
