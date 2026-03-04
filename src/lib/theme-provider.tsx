'use client';

import { useEffect } from 'react';

function isNight(): boolean {
  const h = new Date().getHours();
  return h >= 20 || h < 6;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function sync() {
      document.documentElement.classList.toggle('dark', isNight());
    }
    sync();
    const interval = setInterval(sync, 60_000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
