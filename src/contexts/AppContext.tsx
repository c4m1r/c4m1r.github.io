import { useEffect, useState, type ReactNode } from 'react';
import { AppContext } from './appContextCore';
import { getInitialLanguage, getInitialMode, LANGUAGE_STORAGE_KEY } from './appContextDefaults';
import { type AppMode, type ThemeId } from './appContextTypes';
import { type Language } from '../i18n/translations';
import { subscribeSystemSettings, updateSystemSettings } from '../system/settings/settingsStore';

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>(getInitialMode);
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<ThemeId>('win-xp');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    updateSystemSettings({ language: lang });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  useEffect(() => {
    return subscribeSystemSettings((settings) => {
      if (settings.language !== language) {
        setLanguageState(settings.language);
      }
    });
  }, [language]);

  return (
    <AppContext.Provider value={{ mode, setMode, language, setLanguage, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export { useApp } from './useApp';
export type { AppMode, ThemeId, AppContextType } from './appContextTypes';
