/**
 * Конфигурация всех тем
 * Централизованная система управления темами
 */

import type { ThemeId } from '../contexts/appContextTypes';

// Импортируем обои напрямую через Vite
import winxpBliss from '../content/pictures/wallpapers/winxp-bliss.jpg';
import win7Wallpaper from './win7/assets/images/desktop-wallpaper.jpg';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  family: 'windows' | 'linux' | 'other';
  version?: string;
  hasBootScreen: boolean;
  hasLoginScreen: boolean;
  hasWelcomeScreen: boolean;
  cssFile: string;
  assetsPath: string;
  defaultWallpaper: string;
  soundsEnabled: boolean;
}

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  'win-xp': {
    id: 'win-xp',
    name: 'Windows XP',
    family: 'windows',
    version: 'Professional',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: true,
    cssFile: './themes/winxp/xp.css',
    assetsPath: './themes/winxp/assets',
    defaultWallpaper: winxpBliss,
    soundsEnabled: true,
  },
  'webos': {
    id: 'webos',
    name: 'WebOS',
    family: 'other',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: true,
    cssFile: './styles/os/themes/webos.css',
    assetsPath: './themes/webos/assets',
    defaultWallpaper: winxpBliss,
    soundsEnabled: true,
  },
  'win-98': {
    id: 'win-98',
    name: 'Windows 98',
    family: 'windows',
    version: 'Second Edition',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/classic.css',
    assetsPath: './themes/win98',
    defaultWallpaper: '',
    soundsEnabled: true,
  },
  'win2000': {
    id: 'win2000',
    name: 'Windows 2000',
    family: 'windows',
    version: 'Professional',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/classic.css',
    assetsPath: './themes/win2000/assets',
    defaultWallpaper: '',
    soundsEnabled: true,
  },
  'win7': {
    id: 'win7',
    name: 'Windows 7',
    family: 'windows',
    version: 'Ultimate',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/win7.css',
    assetsPath: './themes/win7/assets',
    defaultWallpaper: win7Wallpaper,
    soundsEnabled: true,
  },
  'win10': {
    id: 'win10',
    name: 'Windows 10',
    family: 'windows',
    hasBootScreen: false,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/win7.css',
    assetsPath: './themes/win10',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'vista': {
    id: 'vista',
    name: 'Windows Vista',
    family: 'windows',
    hasBootScreen: false,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/win7.css',
    assetsPath: './themes/vista',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'win8': {
    id: 'win8',
    name: 'Windows 8',
    family: 'windows',
    hasBootScreen: false,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/win7.css',
    assetsPath: './themes/win8',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'win11': {
    id: 'win11',
    name: 'Windows 11',
    family: 'windows',
    hasBootScreen: false,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/win7.css',
    assetsPath: './themes/win11',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'ubuntu': {
    id: 'ubuntu',
    name: 'Ubuntu',
    family: 'linux',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/ubuntu.css',
    assetsPath: './themes/ubuntu',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'arch': {
    id: 'arch',
    name: 'Arch Linux',
    family: 'linux',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/arch.css',
    assetsPath: './themes/arch',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'halloween': {
    id: 'halloween',
    name: 'Halloween Edition',
    family: 'other',
    hasBootScreen: false,
    hasLoginScreen: false,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/halloween.css',
    assetsPath: './themes/halloween',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'macos-26': {
    id: 'macos-26',
    name: 'macOS Tahoe 26',
    family: 'other',
    version: '26',
    hasBootScreen: false,
    hasLoginScreen: false,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/macos.css',
    assetsPath: './themes/macos',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'ios-26': {
    id: 'ios-26',
    name: 'iOS 26.6.1',
    family: 'other',
    version: '26.6.1',
    hasBootScreen: false,
    hasLoginScreen: false,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/ios.css',
    assetsPath: './themes/ios',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'ios-16': {
    id: 'ios-16',
    name: 'iOS 16.7.16',
    family: 'other',
    version: '16.7.16',
    hasBootScreen: false,
    hasLoginScreen: false,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/ios.css',
    assetsPath: './themes/ios',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'ios-9': {
    id: 'ios-9',
    name: 'iOS 9.3.6',
    family: 'other',
    version: '9.3.6',
    hasBootScreen: false,
    hasLoginScreen: false,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/ios.css',
    assetsPath: './themes/ios',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'ios-5': {
    id: 'ios-5',
    name: 'iOS 5.1.1',
    family: 'other',
    version: '5.1.1',
    hasBootScreen: false,
    hasLoginScreen: false,
    hasWelcomeScreen: false,
    cssFile: './styles/os/themes/ios.css',
    assetsPath: './themes/ios',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
};

/**
 * Получить конфигурацию темы
 */
export function getThemeConfig(themeId: ThemeId): ThemeConfig {
  return THEME_CONFIGS[themeId] || THEME_CONFIGS['win-xp'];
}

/**
 * Проверить, является ли тема частью Windows XP семейства
 */
export function isXPFamily(themeId: ThemeId): boolean {
  return ['win-xp', 'webos'].includes(themeId);
}

/**
 * Проверить, является ли тема частью Windows семейства
 */
export function isWindowsFamily(themeId: ThemeId): boolean {
  return THEME_CONFIGS[themeId]?.family === 'windows';
}
