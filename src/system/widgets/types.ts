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

export function getStoredWidgetsVisibility(): DesktopWidgetsVisibility {
  if (typeof window === 'undefined') return WEBOS_DEFAULT_WIDGETS_VISIBILITY;
  try {
    const raw = localStorage.getItem(WIDGETS_STORAGE_KEY);
    if (raw) {
      return { ...WEBOS_DEFAULT_WIDGETS_VISIBILITY, ...JSON.parse(raw) };
    }
  } catch {
    // Keep defaults
  }
  return WEBOS_DEFAULT_WIDGETS_VISIBILITY;
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

// Shared dimensions across all widget types.
export function createDesktopWidgetPresets() {
  return [
    { id: 'compact', label: 'Компактный', width: 280, height: 140 },
    { id: 'standard', label: 'Стандартный', width: 340, height: 200 },
    { id: 'wide', label: 'Широкий', width: 420, height: 260 },
  ];
}
