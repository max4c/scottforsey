'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEffect } from 'react';

export function FaviconUpdater() {
  const settings = useQuery(api.siteSettings.get);

  useEffect(() => {
    if (!settings?.faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }, [settings?.faviconUrl]);

  return null;
}
