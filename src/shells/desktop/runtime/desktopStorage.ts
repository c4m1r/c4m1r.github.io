import { CUSTOM_WALLPAPER_STORAGE_KEY } from '../desktopConstants';

export function getStoredCustomWallpaper(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(CUSTOM_WALLPAPER_STORAGE_KEY);
}
