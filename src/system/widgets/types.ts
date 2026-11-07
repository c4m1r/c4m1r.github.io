export interface DesktopWidgetsVisibility {
  weather: boolean;
  clock: boolean;
  winamp: boolean;
  quotes: boolean;
  currency: boolean;
  monitor: boolean;
  news: boolean;
  gallery: boolean;
}

export const DEFAULT_WIDGETS_VISIBILITY: DesktopWidgetsVisibility = {
  weather: true,
  clock: true,
  winamp: true,
  quotes: true,
  currency: true,
  monitor: true,
  news: true,
  gallery: true,
};

export const WIDGETS_STORAGE_KEY = 'webos_desktop_widgets_visibility_v1';

export function getStoredWidgetsVisibility(): DesktopWidgetsVisibility {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS_VISIBILITY;
  try {
    const raw = localStorage.getItem(WIDGETS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_WIDGETS_VISIBILITY, ...JSON.parse(raw) };
    }
  } catch {
    // Keep defaults
  }
  return DEFAULT_WIDGETS_VISIBILITY;
}

export function saveStoredWidgetsVisibility(val: DesktopWidgetsVisibility): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('desktop-widgets-visibility-changed', { detail: val }));
  } catch {
    // Ignore
  }
}
