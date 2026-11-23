import { useEffect, useState } from 'react';

/**
 * Real loading progress for a boot screen: the share of the site's boot resources that have
 * finished loading (images decoded and fonts ready). It moves only when the work is done.
 */
export function useBootProgress(imageUrls: Array<string | undefined>): number {
  const urls = imageUrls.filter((url): url is string => Boolean(url));
  const key = urls.join('|');
  const [done, setDone] = useState(0);
  const total = urls.length + 1; // +1 for the page fonts

  useEffect(() => {
    let cancelled = false;
    setDone(0);
    const tick = () => {
      if (!cancelled) setDone((n) => n + 1);
    };

    const images = key ? key.split('|').map((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = tick;
      img.onerror = tick;
      img.src = src;
      return img;
    }) : [];

    const fonts = typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve();
    void fonts.then(tick, tick);

    return () => {
      cancelled = true;
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [key]);

  return Math.min(1, done / total);
}
