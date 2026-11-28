/**
 * Windows wallpapers in the gallery, grouped by the Windows version they belong to.
 * A folder under `src/content/pictures/wallpapers/` named here is one Windows version; the older wallpapers that
 * sit in the shared `windows/` folder are mapped by file name.
 */
export const WINDOWS_WALLPAPER_OS: Record<string, string> = {
  'windows-95-98': 'Windows 95 / 98',
  'windows-xp': 'Windows XP',
  'windows-server-2003': 'Windows Server 2003',
  'windows-vista': 'Windows Vista',
  'windows-7': 'Windows 7',
  'windows-8': 'Windows 8',
  'windows-10': 'Windows 10',
  'windows-11': 'Windows 11',
};

const LEGACY_WINDOWS_WALLPAPERS: Record<string, string> = {
  'vista-wallpaper.jpg': 'windows-vista',
  'windows/win7-home.jpg': 'windows-7',
  'windows/win98-clouds.jpg': 'windows-95-98',
  'windows/winxp-bliss.jpg': 'windows-xp',
  'windows/win10-hero.jpg': 'windows-10',
  'windows/win10-lockscreen.jpg': 'windows-10',
  'windows/win10-nature.jpg': 'windows-10',
};

/** The Windows version label for a wallpaper path relative to `wallpapers/`, or undefined for other wallpapers. */
export function windowsWallpaperOs(relativePath: string): string | undefined {
  const folder = relativePath.split('/')[0];
  if (WINDOWS_WALLPAPER_OS[folder]) return WINDOWS_WALLPAPER_OS[folder];
  const legacy = LEGACY_WINDOWS_WALLPAPERS[relativePath];
  return legacy ? WINDOWS_WALLPAPER_OS[legacy] : undefined;
}

/** Readable title from a file name: drops the long XP wallpaper prefix and the 800x600 size suffix. */
export function wallpaperTitle(fileName: string): string {
  const cleaned = fileName
    .replace(/^windows-xp-desktop-background-wallpaper-/, '')
    .replace(/-800x600.*$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
