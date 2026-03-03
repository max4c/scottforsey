interface WatercolorBlobProps {
  color: string;
  size?: number;
  className?: string;
}

export function WatercolorBlob({ color, size = 300, className = '' }: WatercolorBlobProps) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(ellipse, ${color}35 0%, ${color}15 40%, transparent 70%)`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        filter: 'blur(40px)',
        mixBlendMode: 'multiply',
      }}
      aria-hidden
    />
  );
}
