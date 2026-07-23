import { useState, type ReactNode, useEffect } from 'react';
import { AppContext } from './appContextCore';
import { LANGUAGE_STORAGE_KEY, getInitialLanguage, getInitialMode } from './appContextDefaults';
import { type ThemeId } from './appContextTypes';

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState(getInitialMode);
  const [language, setLanguage] = useState(getInitialLanguage);
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
