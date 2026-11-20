import type { ThemeId } from '../contexts/appContextTypes';
import type { FileSystemItem } from '../utils/FileSystem';
import { THEME_ASSETS, type ThemeAssetId, type ThemeAssets } from './webos/themeAssets';
import { MACOS_APP_ICON_BY_ID, MACOS_SYSTEM_ICON_BY_ID, getIosIconMap } from '../shells/desktop/appleIconAssets';

type IconThemeAssets = ThemeAssets & {
  userAvatar?: string;
  terminalIcon?: string;
  helpIcon?: string;
};

const APP_ASSET_KEYS: Readonly<Record<string, keyof IconThemeAssets>> = {
  about: 'userAvatar',
  'internet-explorer': 'internetExplorerIcon',
  outlook: 'mailIcon',
  'windows-media-player': 'mediaPlayerIcon',
  winamp: 'winampIcon',
  paint: 'paintIcon',
  pictures: 'picturesIcon',
  calendar: 'calendarIcon',
  news: 'newsIcon',
  currency: 'currencyIcon',
  wiki: 'richTextIcon',
  notepad: 'notepadIcon',
  'projects-grid': 'projectsIcon',
  help: 'helpIcon',
  'task-manager': 'performanceMonitorIcon',
  calculator: 'calculatorIcon',
  'control-panel': 'controlPanelIcon',
  terminal: 'terminalIcon',
  blog: 'richTextIcon',
  loops: 'winampIcon',
  minesweeper: 'minesweeperIcon',
  doom1: 'doomIcon',
  doom2: 'doomIcon',
};

const APP_FALLBACKS: Readonly<Record<string, string>> = {
  snake: '/assets/icons/snake-icon.svg',
  memory: '/assets/icons/memory-icon.svg',
};

const APPLE_THEMES = new Set<ThemeId>(['macos-26']);
const IOS_THEMES = new Set<ThemeId>(['ios-5', 'ios-9', 'ios-16', 'ios-26']);

function getThemeAssets(theme: ThemeId): IconThemeAssets {
  const themeKey: ThemeAssetId = theme === 'win-98' || theme === 'win-xp' || theme === 'win2000' || theme === 'win7' || theme === 'webos'
    ? theme
    : 'webos';
  return THEME_ASSETS[themeKey];
}

/**
 * Resolves presentation-only icons. FileSystemItem stays theme-neutral; explicit
 * content thumbnails remain authoritative, while app IDs are rendered through
 * the active OS icon registry.
 */
export function resolveFileIcon(item: FileSystemItem, theme: ThemeId): string {
  if (item.appId) {
    if (APPLE_THEMES.has(theme)) {
      const appleIcon = MACOS_APP_ICON_BY_ID[item.appId] ?? MACOS_SYSTEM_ICON_BY_ID[item.appId];
      if (appleIcon) return appleIcon;
    }
    if (IOS_THEMES.has(theme)) {
      const iosIcon = getIosIconMap(theme)[item.appId];
      if (iosIcon) return iosIcon;
    }
    const assets = getThemeAssets(theme);
    const assetKey = APP_ASSET_KEYS[item.appId];
    const themedIcon = assetKey ? assets[assetKey] : undefined;
    if (typeof themedIcon === 'string') return themedIcon;
    if (APP_FALLBACKS[item.appId]) return APP_FALLBACKS[item.appId];
  }

  if (item.icon && typeof item.icon === 'string') return item.icon;
  if (item.type === 'folder' || item.type === 'drive' || item.type === 'system') {
    if (APPLE_THEMES.has(theme)) return MACOS_SYSTEM_ICON_BY_ID[item.id] ?? MACOS_APP_ICON_BY_ID['projects-grid'] ?? getThemeAssets(theme).folderIcon ?? '';
    if (IOS_THEMES.has(theme)) return getIosIconMap(theme)['my-computer'] ?? getThemeAssets(theme).folderIcon ?? '';
    return getThemeAssets(theme).folderIcon ?? '';
  }
  const extension = item.name.split('.').pop()?.toLocaleLowerCase();
  if (extension === 'txt' || extension === 'md' || extension === 'rtf') {
    return getThemeAssets(theme).richTextIcon ?? getThemeAssets(theme).notepadIcon ?? '';
  }
  return getThemeAssets(theme).richTextIcon ?? getThemeAssets(theme).folderIcon ?? '';
}
