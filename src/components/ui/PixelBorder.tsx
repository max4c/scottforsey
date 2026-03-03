'use client';

interface PixelBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function PixelBorder({ children, className = '', color = 'border-brown' }: PixelBorderProps) {
  return (
    <div className={`border-2 ${color} relative ${className}`}>
      {/* Corner notches for pixel feel */}
      <div className="absolute -top-px -left-px w-1 h-1 bg-cream" />
      <div className="absolute -top-px -right-px w-1 h-1 bg-cream" />
      <div className="absolute -bottom-px -left-px w-1 h-1 bg-cream" />
      <div className="absolute -bottom-px -right-px w-1 h-1 bg-cream" />
      {children}
    </div>
  );
}
