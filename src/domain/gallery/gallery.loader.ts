import { loadPictures, loadWallpapers } from '../../utils/contentLoader';
import { type GalleryItem } from './gallery.types';

/**
 * Normalises raw ImageItem arrays into domain GalleryItem objects.
 * Delegates filesystem scanning to the existing contentLoader utilities
 * so the glob logic stays in one place.
 */
export async function loadGalleryItems(): Promise<GalleryItem[]> {
  const [pictures, wallpapers] = await Promise.all([
    loadPictures(),
    loadWallpapers(),
  ]);

  const pictureItems: GalleryItem[] = pictures.map((pic) => ({
    id: pic.id,
    kind: 'gallery' as const,
    title: pic.name,
    content: pic.path,
    preview: pic.thumbnail,
    imagePath: pic.path,
    thumbnailPath: pic.thumbnail ?? pic.path,
    mediaType: 'picture' as const,
    date: pic.date,
  }));

  const wallpaperItems: GalleryItem[] = wallpapers.map((pic) => ({
    id: `wallpaper__${pic.id}`,
    kind: 'gallery' as const,
    title: pic.name,
    content: pic.path,
    preview: pic.thumbnail,
    imagePath: pic.path,
    thumbnailPath: pic.thumbnail ?? pic.path,
    mediaType: 'wallpaper' as const,
    date: pic.date,
  }));

  return [...pictureItems, ...wallpaperItems];
}

/** Convenience: only pictures (non-wallpaper) */
export async function loadPictureItems(): Promise<GalleryItem[]> {
  const all = await loadGalleryItems();
  return all.filter((item) => item.mediaType === 'picture');
}

/** Convenience: only wallpapers */
export async function loadWallpaperItems(): Promise<GalleryItem[]> {
  const all = await loadGalleryItems();
  return all.filter((item) => item.mediaType === 'wallpaper');
}
