import { type ThemeId } from '../../contexts/appContextTypes';

export const DESKTOP_PATH = 'C:\\Documents and Settings\\C4m1r\\Desktop';
export const MINESWEEPER_WINDOW_ID = 'app:minesweeper';
export const CUSTOM_WALLPAPER_STORAGE_KEY = 'desktop-custom-wallpaper';
export const DEFAULT_DESKTOP_VIEWPORT = { width: 1280, height: 720 } as const;
export const DESKTOP_DRAG_Z_INDEX = 1000;

export const XP_FAMILY_THEMES: readonly ThemeId[] = ['win-xp', 'webos'];

// Map ThemeId values to os-* CSS class suffixes defined in src/styles/os/.
export const OS_CLASS_MAP: Record<string, string> = {
  'win-xp': 'winxp',
  webos: 'winxp',
  'win-98': 'classic',
  win7: 'win7',
  win10: 'win7',
  win11: 'win7',
  ubuntu: 'ubuntu',
  arch: 'ubuntu',
};
