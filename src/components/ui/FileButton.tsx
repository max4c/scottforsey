'use client';

import { useRef } from 'react';

interface FileButtonProps {
  accept: string;
  onChange: (file: File | null) => void;
  onClear?: () => void;
  selectedName?: string;
  label: string;
  icon?: React.ReactNode;
}

export function FileButton({ accept, onChange, onClear, selectedName, label, icon }: FileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-brown/25 bg-parchment/40 text-brown-light text-sm font-semibold active:bg-parchment transition-colors hover:border-sunset/50 hover:text-brown"
      >
        {icon ?? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-60">
            <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
          </svg>
        )}
        {label}
      </button>
      {selectedName && (
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-brown-lighter truncate max-w-[140px]" title={selectedName}>
            {selectedName}
          </span>
          {onClear && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="flex-shrink-0 text-brown-lighter active:text-berry"
              aria-label="Remove file"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
        </span>
      )}
    </div>
  );
}
