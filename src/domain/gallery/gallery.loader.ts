import { getPictureAssetEntries } from '../assets/assetResolver';
import { sitePathBuilders } from '../content/sitePathBuilders';
import { type GalleryItem } from './gallery.types';

export interface ImageItem {
  id: string;
  name: string;
  path: string;
  thumbnail?: string;
  size?: string;
  date?: string;
}

const imageExtensionPattern = /\.(jpg|jpeg|png|gif|webp)$/i;
const wallpaperExtensionPattern = /\.(jpg|jpeg|png|webp)$/i;

export async function loadPictures(): Promise<ImageItem[]> {
  const pictures: ImageItem[] = [];

  try {
    for (const [path, url] of getPictureAssetEntries()) {
      const filename = path.split('/').pop() || '';
      const name = filename.replace(imageExtensionPattern, '');

      pictures.push({
        id: filename,
        name,
        path: url,
        thumbnail: url,
      });
    }
  } catch (error) {
    console.error('[GalleryLoader] Failed to load pictures:', error);
  }

  return pictures;
}

export async function loadWallpapers(): Promise<ImageItem[]> {
  const wallpapers: ImageItem[] = [];

  try {
    for (const [path, url] of getPictureAssetEntries()) {
      if (!path.includes('/wallpapers/')) continue;
      const filename = path.split('/').pop() || '';
      const name = filename.replace(wallpaperExtensionPattern, '');

      wallpapers.push({
        id: filename,
        name,
        path: url,
        thumbnail: url,
      });
    }
  } catch (error) {
    console.error('[GalleryLoader] Failed to load wallpapers:', error);
  }

  return wallpapers;
}

/**
 * Normalises raw image arrays into domain GalleryItem objects.
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
    route: {
      path: sitePathBuilders.galleryItem(pic.id),
      sitePath: sitePathBuilders.galleryItem(pic.id),
      osUri: `gallery://${pic.id}`,
      appId: 'pictures',
    },
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
    route: {
      path: sitePathBuilders.galleryItem(`wallpaper__${pic.id}`),
      sitePath: sitePathBuilders.galleryItem(`wallpaper__${pic.id}`),
      osUri: `gallery://wallpaper/${pic.id}`,
      appId: 'pictures',
    },
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
