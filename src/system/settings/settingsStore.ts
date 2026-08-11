import { type Language, detectLanguage } from '../../i18n/translations';
import { type SettingsStorageAdapter, type SystemSettings } from './settingsTypes';

export const SYSTEM_SETTINGS_STORAGE_KEY = 'c4m1r-system-settings';
export const LEGACY_LANGUAGE_KEY = 'webos-language';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  version: 1,
  language: 'ru',
  effects: {
    fireworksEnabled: true,
    weatherEffectsEnabled: true,
    soundEffectsEnabled: true,
  },
  ui: {
    rememberLastOs: false,
    lastOsProfileId: null,
  },
  perOs: {},
};

export class BrowserLocalStorageSettingsAdapter implements SettingsStorageAdapter {
  private key: string;

  constructor(key: string = SYSTEM_SETTINGS_STORAGE_KEY) {
    this.key = key;
  }

  read(): SystemSettings | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(this.key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1) {
          return parsed as SystemSettings;
        }
      }

      // Legacy fallback read
      const legacyLang = window.localStorage.getItem(LEGACY_LANGUAGE_KEY);
      const initialLang: Language =
        legacyLang === 'en' || legacyLang === 'ru'
          ? legacyLang
          : detectLanguage();

      return {
        ...DEFAULT_SYSTEM_SETTINGS,
        language: initialLang,
      };
    } catch {
      return null;
    }
  }

  write(settings: SystemSettings): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(settings));
      window.localStorage.setItem(LEGACY_LANGUAGE_KEY, settings.language);
    } catch {
      // Ignore quota or serialization errors
    }
  }

  reset(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(this.key);
      window.localStorage.removeItem(LEGACY_LANGUAGE_KEY);
    } catch {
      // Ignore errors
    }
  }
}

const storageAdapter: SettingsStorageAdapter = new BrowserLocalStorageSettingsAdapter();
let currentSettings: SystemSettings =
  storageAdapter.read() ?? DEFAULT_SYSTEM_SETTINGS;
const listeners = new Set<(settings: SystemSettings) => void>();

export function getSystemSettings(): SystemSettings {
  return currentSettings;
}

export function updateSystemSettings(
  partial: Partial<SystemSettings> | ((prev: SystemSettings) => SystemSettings)
): SystemSettings {
  const next =
    typeof partial === 'function'
      ? partial(currentSettings)
      : {
          ...currentSettings,
          ...partial,
          effects: { ...currentSettings.effects, ...partial.effects },
          ui: { ...currentSettings.ui, ...partial.ui },
        };

  currentSettings = next;
  storageAdapter.write(currentSettings);
  listeners.forEach((listener) => listener(currentSettings));
  return currentSettings;
}

export function resetSystemSettings(): SystemSettings {
  storageAdapter.reset();
  currentSettings = { ...DEFAULT_SYSTEM_SETTINGS };
  listeners.forEach((listener) => listener(currentSettings));
  return currentSettings;
}

export function subscribeSystemSettings(
  listener: (settings: SystemSettings) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
