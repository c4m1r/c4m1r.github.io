import { useEffect, useState, type ReactNode } from 'react';
import { AppContext } from './appContextCore';
import { getInitialLanguage, getInitialMode, LANGUAGE_STORAGE_KEY } from './appContextDefaults';
import { type AppMode, type ThemeId } from './appContextTypes';
import { type Language } from '../i18n/translations';

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>(getInitialMode);
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<ThemeId>('win-xp');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  return (
    <AppContext.Provider value={{ mode, setMode, language, setLanguage, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export { useApp } from './useApp';
export type { AppMode, ThemeId, AppContextType } from './appContextTypes';
