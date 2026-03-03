'use client';

import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'pixel';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-sky text-white hover:bg-sky-dark',
  secondary: 'bg-parchment text-brown hover:bg-cream-dark border border-brown-lighter/30',
  ghost: 'text-brown-light hover:text-brown hover:bg-parchment/50',
  pixel: 'bg-sunset text-white font-pixel text-[10px] border-2 border-brown',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`inline-flex items-center justify-center rounded-lg font-display font-semibold transition-colors
        ${variants[variant]} ${sizes[size]} ${className}
        disabled:opacity-50 disabled:pointer-events-none`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
