'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    function sync() {
      const h = new Date().getHours();
      document.documentElement.classList.toggle('dark', h >= 20 || h < 6 || mql.matches);
    }
    sync();
    const interval = setInterval(sync, 60_000);
    mql.addEventListener('change', sync);
    return () => {
      clearInterval(interval);
      mql.removeEventListener('change', sync);
    };
  }, []);

  return <>{children}</>;
}
