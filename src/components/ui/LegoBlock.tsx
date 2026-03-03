'use client';

import { motion } from 'framer-motion';

interface LegoBlockProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  studs?: number;
  onClick?: () => void;
}

const colorMap: Record<string, string> = {
  sky: 'bg-sky',
  sunset: 'bg-sunset',
  berry: 'bg-berry',
  grass: 'bg-grass',
  red: 'bg-lego-red',
  blue: 'bg-lego-blue',
  yellow: 'bg-lego-yellow',
  green: 'bg-lego-green',
};

export function LegoBlock({ children, color = 'sky', className = '', studs = 6, onClick }: LegoBlockProps) {
  const bgClass = colorMap[color] || 'bg-sky';

  return (
    <motion.div
      className={`rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow ${className}`}
      whileHover={{ y: -4 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`h-6 ${bgClass} flex items-center gap-1.5 px-2`}>
        {Array.from({ length: studs }).map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/25 border border-white/10" />
        ))}
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}
