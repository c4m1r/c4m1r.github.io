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
  weather: false,
  clock: false,
  winamp: false,
  quotes: false,
  currency: false,
  monitor: false,
  news: false,
  gallery: false,
};

export const WEBOS_DEFAULT_WIDGETS_VISIBILITY: DesktopWidgetsVisibility = {
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

export function getStoredWidgetsVisibility(
  storageKey = WIDGETS_STORAGE_KEY,
  defaults: DesktopWidgetsVisibility = DEFAULT_WIDGETS_VISIBILITY,
): DesktopWidgetsVisibility {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    // Keep the OS-specific defaults
  }
  return defaults;
}

export function saveStoredWidgetsVisibility(
  val: DesktopWidgetsVisibility,
  storageKey = WIDGETS_STORAGE_KEY,
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('desktop-widgets-visibility-changed', { detail: val }));
  } catch {
    // Ignore
  }
}

// Shared dimensions across all widget types.
export function createDesktopWidgetPresets() {
  return [
    { id: 'compact', label: 'Компактный', width: 280, height: 140 },
    { id: 'standard', label: 'Стандартный', width: 340, height: 200 },
    { id: 'wide', label: 'Широкий', width: 420, height: 260 },
  ];
}
