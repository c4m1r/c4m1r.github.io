import { type ThemeId } from '../../contexts/appContextTypes';
import { OS_CLASS_MAP } from '../os/osClassNames';

export const DESKTOP_PATH = 'C:\\Documents and Settings\\C4m1r\\Desktop';
export const MINESWEEPER_WINDOW_ID = 'app:minesweeper';
export const CUSTOM_WALLPAPER_STORAGE_KEY = 'desktop-custom-wallpaper';
export const DEFAULT_DESKTOP_VIEWPORT = { width: 1280, height: 720 } as const;
export const DESKTOP_DRAG_Z_INDEX = 1000;

export const XP_FAMILY_THEMES: readonly ThemeId[] = ['win-xp', 'webos'];

// Canonical OS class mapping is owned by shells/os.
export { OS_CLASS_MAP };
