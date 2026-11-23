import { THEME_ASSETS, type ThemeAssets, type ThemeAssetId } from './webos/themeAssets';

/**
 * Boot-resource preload for every Windows-family theme.
 *
 * - primeBootTheme() runs inside the user's click on the GRUB menu. It starts decoding the
 *   wallpaper, boot logo and progress art, so the boot screen has them ready.
 *
 * The startup sound is not played on any boot screen. It plays on the desktop, when the user
 * actually logs on (see DesktopShellContainer).
 */

const imageCache = new Map<string, HTMLImageElement>();

function getThemeAssets(theme: string): ThemeAssets {
  return (THEME_ASSETS as Record<string, ThemeAssets>)[theme as ThemeAssetId] ?? THEME_ASSETS.webos;
}

function preloadImage(src?: string) {
  if (!src || imageCache.has(src)) return;
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  imageCache.set(src, img);
}

export function primeBootTheme(theme: string): void {
  const assets = getThemeAssets(theme);
  preloadImage(assets.wallpaper);
  preloadImage(assets.bootLogo);
  preloadImage(assets.bootProgress);
  // Warms the HTTP cache so the boot screen's <video> starts from memory.
  if (assets.bootVideo) void fetch(assets.bootVideo, { cache: 'force-cache' }).catch(() => undefined);
}
