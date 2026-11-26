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

const AUDIO_RE = /\.(wav|mp3|ogg)(\?|$)/i;
const IMAGE_RE = /\.(png|jpe?g|gif|webp|svg|ico|cur|bmp)(\?|$)/i;
/** Longest wait for a theme's media; the session continues after this even if something is slow. */
const ASSET_WAIT_MS = 10000;

const readyByTheme = new Map<string, Promise<void>>();
function collectMediaUrls(value: unknown, out: Set<string>): void {
  if (typeof value === 'string') {
    if (AUDIO_RE.test(value) || IMAGE_RE.test(value)) out.add(value);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectMediaUrls(item, out);
  }
}

/**
 * Warms the HTTP cache only. The old version created an Image or Audio element per asset and kept
 * them alive, which made the browser decode every icon and buffer every sound (roughly +70 MB per tab).
 * A plain fetch downloads the bytes without decoding or holding them, and the elements that actually
 * need an asset decode it on demand from the cache.
 */
function loadMedia(url: string): Promise<void> {
  return fetch(url, { cache: 'force-cache' })
    .then((response) => response.blob())
    .then(() => undefined)
    .catch(() => undefined);
}

/** Downloads at most this many assets at once, so the logon screen stays responsive. */
const PRELOAD_CONCURRENCY = 6;

async function loadAll(urls: string[]): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < urls.length) await loadMedia(urls[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(PRELOAD_CONCURRENCY, urls.length) }, worker));
}

/**
 * Loads every image and sound a theme uses (wallpaper, desktop and start menu icons, sounds) into
 * the browser cache, so the desktop is ready when the user logs on. Started on the logon screen;
 * the returned promise resolves when everything has loaded or after ASSET_WAIT_MS.
 */
export function preloadThemeAssets(theme: string): Promise<void> {
  const cached = readyByTheme.get(theme);
  if (cached) return cached;
  const urls = new Set<string>();
  collectMediaUrls(getThemeAssets(theme), urls);
  const all = loadAll([...urls]);
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, ASSET_WAIT_MS));
  const ready = Promise.race([all, timeout]);
  readyByTheme.set(theme, ready);
  return ready;
}
