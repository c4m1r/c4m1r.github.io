import { type GalleryItem } from './gallery.types';
import { routes } from '../../shells/site/siteRoutes';

export interface ImageItem {
  id: string;
  name: string;
  path: string;
  thumbnail?: string;
  size?: string;
  date?: string;
}

const pictureModules = import.meta.glob('/src/content/pictures/**/*.{jpg,jpeg,png,gif,webp}', {
  query: '?url',
  import: 'default',
  eager: false,
});

const wallpaperModules = import.meta.glob('/src/content/pictures/wallpapers/*.{jpg,jpeg,png,webp}', {
  query: '?url',
  import: 'default',
  eager: false,
});

export async function loadPictures(): Promise<ImageItem[]> {
  const pictures: ImageItem[] = [];
  try {
    for (const path in pictureModules) {
      const url = (await pictureModules[path]()) as string;
      const filename = path.split('/').pop() || '';
      const name = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

      pictures.push({
        id: filename,
        name,
        path: url,
        thumbnail: url,
      });
    }
  } catch (error) {
    console.error('Failed to load pictures:', error);
  }
  return pictures;
}

export async function loadWallpapers(): Promise<ImageItem[]> {
  const wallpapers: ImageItem[] = [];
  try {
    for (const path in wallpaperModules) {
      const url = (await wallpaperModules[path]()) as string;
      const filename = path.split('/').pop() || '';
      const name = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');

      wallpapers.push({
        id: filename,
        name,
        path: url,
        thumbnail: url,
      });
    }
  } catch (error) {
    console.error('Failed to load wallpapers:', error);
  }
  return wallpapers;
}

/**
 * Normalises raw ImageItem arrays into domain GalleryItem objects.
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
      path: routes.galleryItem(pic.id),
      sitePath: routes.galleryItem(pic.id),
      osUri: `pictures://${pic.id}`,
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
      path: routes.galleryItem(`wallpaper__${pic.id}`),
      sitePath: routes.galleryItem(`wallpaper__${pic.id}`),
      osUri: `pictures://wallpaper/${pic.id}`,
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
