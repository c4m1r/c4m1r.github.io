import { getActiveBootProfileId } from '../bootProfile';
import server2003Wallpaper from './assets/wallpaper.png';

/**
 * Windows Server 2003 runs on the Windows XP theme (the XP family), so only its desktop wallpaper differs.
 * The clean Server 2003 wallpaper replaces the XP Bliss wallpaper when this boot profile is active.
 */
export function isServer2003Shell(theme: string): boolean {
  return theme === 'win-xp' && getActiveBootProfileId() === 'server2003';
}

export function server2003ThemeAssets<T extends object>(base: T): T {
  return { ...base, wallpaper: server2003Wallpaper } as T;
}
