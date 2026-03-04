'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEffect } from 'react';

function imageToFaviconDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('no canvas context')); return; }
      // Square-crop from center
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      const ox = (img.naturalWidth - s) / 2;
      const oy = (img.naturalHeight - s) / 2;
      ctx.drawImage(img, ox, oy, s, s, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function FaviconUpdater() {
  const settings = useQuery(api.siteSettings.get);

  useEffect(() => {
    if (!settings?.faviconUrl) return;
    imageToFaviconDataUrl(settings.faviconUrl).then((dataUrl) => {
      let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/png';
      link.href = dataUrl;
    }).catch(() => {
      // Fallback: set directly without conversion
      let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl!;
    });
  }, [settings?.faviconUrl]);

  return null;
}
