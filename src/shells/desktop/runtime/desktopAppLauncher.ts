import { type DesktopAppDefinition } from '../types';
import { findAppDefinition } from './appLaunch';
import { type Language } from '../../../i18n/translations';

export interface ResolvedAppWindowConfig {
  app: DesktopAppDefinition;
  windowId: string;
  title: string;
  iconSrc?: string;
  width: number;
  height: number;
  resizable: boolean;
}

export function resolveAppWindowConfig(
  appRegistry: Record<string, DesktopAppDefinition>,
  appId: string,
  themeAssets: Record<string, string | undefined>,
  language: Language,
  fallbackTextIcon?: string
): ResolvedAppWindowConfig | null {
  const app = findAppDefinition(appRegistry, appId);
  if (!app) return null;

  let iconSrc = app.iconKey ? (themeAssets[app.iconKey] as string | undefined) : undefined;
  if (!iconSrc && app.iconKey === 'richTextIcon') {
    iconSrc = fallbackTextIcon;
  }
  if (!iconSrc && app.iconKey === 'notepadIcon') {
    iconSrc = themeAssets.notepadIcon ?? fallbackTextIcon;
  }

  const windowId = appId === 'notepad' ? `app:notepad-${Date.now()}` : `app:${appId}`;
  const title = app.title[language] || app.title['en'] || appId;

  return {
    app,
    windowId,
    title,
    iconSrc,
    width: app.defaultWindow.width,
    height: app.defaultWindow.height,
    resizable: app.defaultWindow.resizable ?? true,
  };
}

export const RUN_COMMAND_ALIASES: Record<string, string> = {
  notepad: 'notepad',
  calc: 'calculator',
  calculator: 'calculator',
  mspaint: 'paint',
  paint: 'paint',
  pbrush: 'paint',
  explorer: 'my-computer',
  cmd: 'terminal',
  terminal: 'terminal',
  taskmgr: 'task-manager',
  taskmanager: 'task-manager',
  control: 'control-panel',
  iexplore: 'internet-explorer',
  winmine: 'minesweeper',
  minesweeper: 'minesweeper',
  pictures: 'pictures',
  pics: 'pictures',
  blog: 'blog',
  wiki: 'wiki',
  calendar: 'calendar',
  projects: 'projects-grid',
  games: 'games-folder',
  doom1: 'doom1',
  doom2: 'doom2',
  doom3: 'doom3',
};

export function resolveRunCommandTarget(command: string): string | undefined {
  const normalized = command.trim().toLowerCase();
  return RUN_COMMAND_ALIASES[normalized];
}
