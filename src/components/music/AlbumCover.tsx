'use client';

import { useState } from 'react';

interface AlbumCoverProps {
  coverUrl?: string | null;
  gradientFrom?: string;
  gradientTo?: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-14 h-14 md:w-20 md:h-20',
};

export function AlbumCover({ coverUrl, gradientFrom, gradientTo, title, size = 'md', className = '' }: AlbumCoverProps) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = sizes[size];
  const from = gradientFrom ?? '#f4a261';
  const to = gradientTo ?? '#e76f51';

  if (coverUrl && !imgError) {
    return (
      <img
        src={coverUrl}
        alt={title}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-lg object-cover shadow-sm flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-lg flex-shrink-0 shadow-sm ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    />
  );
}
