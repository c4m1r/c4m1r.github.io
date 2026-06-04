import { useState, useEffect, useMemo } from 'react';
import { loadGalleryItems } from './gallery.loader';
import { type GalleryItem } from './gallery.types';

export interface UseGalleryResult {
  items: GalleryItem[];
  pictures: GalleryItem[];
  wallpapers: GalleryItem[];
  loading: boolean;
  /** Items grouped by lower-cased tag */
  byTag: Map<string, GalleryItem[]>;
}

/**
 * Hook to retrieve all gallery items (pictures + wallpapers).
 * Gallery images are static assets — language-independent.
 */
export function useGallery(): UseGalleryResult {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    loadGalleryItems()
      .then((loaded) => {
        if (!active) return;
        setItems(loaded);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useGallery] Failed to load gallery items:', err);
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const pictures = useMemo(
    () => items.filter((i) => i.mediaType === 'picture'),
    [items],
  );

  const wallpapers = useMemo(
    () => items.filter((i) => i.mediaType === 'wallpaper'),
    [items],
  );

  const byTag = useMemo<Map<string, GalleryItem[]>>(() => {
    const map = new Map<string, GalleryItem[]>();
    for (const item of items) {
      for (const tag of item.tags ?? []) {
        const key = tag.toLowerCase();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item);
      }
    }
    return map;
  }, [items]);

  return { items, pictures, wallpapers, loading, byTag };
}
