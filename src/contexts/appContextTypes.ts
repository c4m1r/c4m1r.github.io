import { type Language } from '../i18n/translations';

export type AppMode = 'bios' | 'grub' | 'blog' | 'webos' | 'terminal' | 'poweroff';
export type ThemeId =
  | 'win-98'
  | 'win-xp'
  | 'win2000'
  | 'webos'
  | 'win7'
  | 'win10'
  | 'win11'
  | 'ubuntu'
  | 'arch'
  | 'halloween'
  | 'macos-26'
  | 'ios-26'
  | 'ios-16'
  | 'ios-9'
  | 'ios-5';

export interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}
