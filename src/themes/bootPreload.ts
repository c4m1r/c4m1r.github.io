import { THEME_ASSETS, type ThemeAssets, type ThemeAssetId } from './webos/themeAssets';

/**
 * One boot-resource layer for every Windows-family theme.
 *
 * - primeBootTheme() runs inside the user's click or key press on the GRUB menu.
 *   Browsers only allow audio after a user gesture, so the startup sound starts
 *   there, and the wallpaper, boot logo and progress art begin decoding at once.
 * - playBootStartup() is called by each boot screen. It is a no-op once the sound
 *   has started for that theme in this session.
 * - If the browser still blocks playback (e.g. autoboot without a gesture), the
 *   sound is retried on the first pointer or key press anywhere on the page.
 * - hasBootStartupPlayed() lets the desktop skip its own startup sound, so the
 *   sound plays once per boot, on the boot screen.
 */

const audioCache = new Map<string, HTMLAudioElement>();
const imageCache = new Map<string, HTMLImageElement>();
const startedThemes = new Set<string>();
let pendingTheme: string | null = null;
let unlockArmed = false;

function getThemeAssets(theme: string): ThemeAssets {
  return (THEME_ASSETS as Record<string, ThemeAssets>)[theme as ThemeAssetId] ?? THEME_ASSETS.webos;
}

function getAudio(src: string): HTMLAudioElement {
  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 0.5;
    audioCache.set(src, audio);
    audio.load();
  }
  return audio;
}

function preloadImage(src?: string) {
  if (!src || imageCache.has(src)) return;
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  imageCache.set(src, img);
}

function armUnlock() {
  if (unlockArmed || typeof window === 'undefined') return;
  unlockArmed = true;
  const retry = () => {
    if (pendingTheme) playBootStartup(pendingTheme);
  };
  window.addEventListener('pointerdown', retry);
  window.addEventListener('keydown', retry);
}

export function playBootStartup(theme: string): void {
  const src = getThemeAssets(theme).startupSound;
  if (!src || startedThemes.has(theme)) return;
  startedThemes.add(theme);
  const audio = getAudio(src);
  audio.currentTime = 0;
  void audio.play().then(
    () => {
      if (pendingTheme === theme) pendingTheme = null;
    },
    () => {
      // Blocked until the next user gesture; the desktop may still play it later.
      startedThemes.delete(theme);
      pendingTheme = theme;
    },
  );
}

export function primeBootTheme(theme: string): void {
  const assets = getThemeAssets(theme);
  armUnlock();
  preloadImage(assets.wallpaper);
  preloadImage(assets.bootLogo);
  preloadImage(assets.bootProgress);
  if (assets.startupSound) getAudio(assets.startupSound);
  // Warms the HTTP cache so the boot screen's <video> starts from memory.
  if (assets.bootVideo) void fetch(assets.bootVideo, { cache: 'force-cache' }).catch(() => undefined);
  playBootStartup(theme);
}

export function hasBootStartupPlayed(theme: string): boolean {
  return startedThemes.has(theme);
}
