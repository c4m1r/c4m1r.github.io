/**
 * Catalogue of Windows wallpapers and backgrounds in the gallery.
 *
 * The files stay where they are: the reference packs under `src/assets/reference/` and the theme and content
 * folders. This module links them to a Windows version, a title and tags. Two layers work together:
 *   1. folder rules: every file in a pack folder belongs to that folder's Windows version and gets a title from its name;
 *   2. named entries: a file that needs a specific title or tags (defaults, theme backgrounds, legacy files) is listed by path.
 * Paths are written relative to `src/`. The glob patterns that find these files live in `gallery.loader.ts`, because
 * Vite only accepts literal patterns there.
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

export interface WindowsWallpaperMeta {
  /** Windows version label, e.g. "Windows XP". */
  os: string;
  /** Title shown in the gallery and the picture viewer. */
  title: string;
  /** Tags written out in full, e.g. "default", "theme background". The version label is always a tag too. */
  tags: string[];
}

/** Pack folders: every image inside belongs to one Windows version. */
const FOLDER_RULES: Array<{ folder: string; os: string; title: (file: string) => string }> = [
  { folder: 'assets/reference/winretro/winxp/wallpapers/', os: 'windows-xp', title: cleanTitle },
  { folder: 'assets/reference/winretro/winvista/wallpapers/', os: 'windows-vista', title: numberedTitle },
  { folder: 'assets/reference/winretro/win9x/wallpapers/', os: 'windows-95-98', title: cleanTitle },
  { folder: 'assets/reference/windows-misc/win11-wallpapers/', os: 'windows-11', title: numberedTitle },
  { folder: 'assets/reference/windows-misc/win8-wallpapers/', os: 'windows-8', title: cleanTitle },
  { folder: 'assets/reference/windows-misc/server2003-wallpapers/', os: 'windows-server-2003', title: cleanTitle },
];

/** Named entries: specific titles, tags and versions, keyed by path relative to `src/`. */
const NAMED_ENTRIES: Record<string, { os: string; title: string; tags?: string[] }> = {
  // Defaults that shipped with each version.
  'assets/reference/windows-misc/win11-wallpapers/win11-img0.jpg': { os: 'windows-11', title: 'Bloom', tags: ['default'] },
  'assets/reference/windows-misc/win8-wallpapers/win8-daisy.jpg': { os: 'windows-8', title: 'Daisy', tags: ['default'] },
  'assets/reference/windows-misc/server2003-wallpapers/server2003-clean.png': { os: 'windows-server-2003', title: 'Clean desktop', tags: ['default'] },
  'content/pictures/wallpapers/windows/winxp-bliss.jpg': { os: 'windows-xp', title: 'Bliss', tags: ['default'] },
  'content/pictures/wallpapers/windows/win98-clouds.jpg': { os: 'windows-95-98', title: 'Clouds', tags: ['default'] },
  'content/pictures/wallpapers/windows/win7-home.jpg': { os: 'windows-7', title: 'Home', tags: ['default'] },
  'content/pictures/wallpapers/vista-wallpaper.jpg': { os: 'windows-vista', title: 'Vista', tags: ['default'] },
  // Backgrounds used by the themes.
  'themes/vista/assets/wallpaper-aero.jpg': { os: 'windows-vista', title: 'Aero', tags: ['theme background'] },
  'themes/win7/assets/images/login-background.jpg': { os: 'windows-7', title: 'Logon background', tags: ['theme background', 'logon'] },
  'themes/win10/assets/wallpaper.jpg': { os: 'windows-10', title: 'Desktop', tags: ['theme background'] },
  // Windows 10 pictures kept in the shared folder.
  'content/pictures/wallpapers/windows/win10-hero.jpg': { os: 'windows-10', title: 'Hero' },
  'content/pictures/wallpapers/windows/win10-lockscreen.jpg': { os: 'windows-10', title: 'Lock screen', tags: ['lock screen'] },
  'content/pictures/wallpapers/windows/win10-nature.jpg': { os: 'windows-10', title: 'Nature' },
};

function fileBase(path: string): string {
  return path.split('/').pop()?.replace(/\.(jpg|jpeg|png|webp)$/i, '') ?? path;
}

function cleanTitle(file: string): string {
  const cleaned = fileBase(file)
    .replace(/^(windows-xp-desktop-background-wallpaper|win8|win11|server2003|windows-98|windows-95)-/, '')
    .replace(/-800x600.*$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function numberedTitle(file: string): string {
  const number = fileBase(file).match(/(\d+)/)?.[1];
  return number ? `Wallpaper ${Number(number)}` : cleanTitle(file);
}

/**
 * Resolves a file under `src/` (e.g. `assets/reference/winretro/winxp/wallpapers/x.jpg`) to its Windows metadata,
 * or `undefined` when the file is not a Windows wallpaper.
 */
export function resolveWindowsWallpaper(srcRelativePath: string): WindowsWallpaperMeta | undefined {
  const named = NAMED_ENTRIES[srcRelativePath];
  if (named) {
    return { os: WINDOWS_WALLPAPER_OS[named.os], title: named.title, tags: [WINDOWS_WALLPAPER_OS[named.os], ...(named.tags ?? [])] };
  }
  const rule = FOLDER_RULES.find((entry) => srcRelativePath.startsWith(entry.folder));
  if (rule) {
    const os = WINDOWS_WALLPAPER_OS[rule.os];
    return { os, title: rule.title(srcRelativePath), tags: [os] };
  }
  return undefined;
}
