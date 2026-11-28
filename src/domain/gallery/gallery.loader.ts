import { type GalleryItem } from './gallery.types';
import { routes } from '../../shells/site/siteRoutes';
import { resolveWindowsWallpaper } from './windowsWallpapers';

export interface ImageItem {
  id: string;
  name: string;
  path: string;
  thumbnail?: string;
  size?: string;
  date?: string;
  /** Windows version label for Windows wallpapers (used as the tag and in the title). */
  tags?: string[];
}

const pictureModules = import.meta.glob('/src/content/pictures/**/*.{jpg,jpeg,png,gif,webp}', {
  query: '?url',
  import: 'default',
  eager: false,
});

const wallpaperModules = import.meta.glob('/src/content/pictures/wallpapers/**/*.{jpg,jpeg,png,webp}', {
  query: '?url',
  import: 'default',
  eager: false,
});

// Windows wallpapers that live outside the gallery folder: the reference packs and the theme backgrounds.
// They are linked to their Windows version through the catalogue, not copied.
const windowsPackModules = import.meta.glob([
  '/src/assets/reference/winretro/winxp/wallpapers/*.{jpg,jpeg,png,webp}',
  '/src/assets/reference/winretro/winvista/wallpapers/*.{jpg,jpeg,png,webp}',
  '/src/assets/reference/winretro/win9x/wallpapers/*.{jpg,jpeg,png,webp}',
  '/src/assets/reference/windows-misc/win11-wallpapers/*.{jpg,jpeg,png,webp}',
  '/src/assets/reference/windows-misc/win8-wallpapers/*.{jpg,jpeg,png,webp}',
  '/src/assets/reference/windows-misc/server2003-wallpapers/*.{jpg,jpeg,png,webp}',
], {
  query: '?url',
  import: 'default',
  eager: false,
});

const windowsThemeModules = import.meta.glob([
  '/src/themes/vista/assets/wallpaper-aero.jpg',
  '/src/themes/win7/assets/images/login-background.jpg',
  '/src/themes/win10/assets/wallpaper.jpg',
], {
  query: '?url',
  import: 'default',
  eager: false,
});

export async function loadPictures(): Promise<ImageItem[]> {
  const pictures: ImageItem[] = [];
  try {
    for (const path in pictureModules) {
      // Wallpapers have their own gallery media type and are loaded below.
      if (path.includes('/wallpapers/')) continue;
      const url = (await pictureModules[path]()) as string;
      const relativePath = path.split('/src/content/pictures/')[1] || path;
      const filename = relativePath.split('/').pop() || '';
      const name = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

      pictures.push({
        id: relativePath,
        name,
        path: url,
        thumbnail: url,
      });
    }
  } catch (error) {
    console.error('Failed to load pictures:', error);
  }
  return pictures.sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadWallpapers(): Promise<ImageItem[]> {
  const wallpapers: ImageItem[] = [];
  try {
    for (const path in wallpaperModules) {
      const url = (await wallpaperModules[path]()) as string;
      const relativePath = path.split('/src/content/pictures/wallpapers/')[1] || path;
      const filename = relativePath.split('/').pop() || '';
      const srcRelative = path.replace('/src/', '');
      const meta = resolveWindowsWallpaper(srcRelative);
      wallpapers.push({
        id: relativePath,
        name: meta ? `${meta.os}: ${meta.title}` : filename.replace(/\.(jpg|jpeg|png|webp)$/i, ''),
        path: url,
        thumbnail: url,
        tags: meta?.tags,
      });
    }
    // Windows packs and theme backgrounds: linked, not copied.
    for (const modules of [windowsPackModules, windowsThemeModules]) {
      for (const path in modules) {
        const url = (await modules[path]()) as string;
        const srcRelative = path.replace('/src/', '');
        const meta = resolveWindowsWallpaper(srcRelative);
        if (!meta) continue;
        wallpapers.push({
          id: `windows/${srcRelative}`,
          name: `${meta.os}: ${meta.title}`,
          path: url,
          thumbnail: url,
          tags: meta.tags,
        });
      }
    }
  } catch (error) {
    console.error('Failed to load wallpapers:', error);
  }
  return wallpapers.sort((a, b) => a.name.localeCompare(b.name));
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
    tags: pic.tags,
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
