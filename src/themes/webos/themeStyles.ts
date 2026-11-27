export type ThemeId = 'webos' | 'win-xp' | 'win-98' | 'win7' | 'win2000' | 'vista' | 'win10' | 'win11';

export interface ThemeStyleConfig {
  body: string[];
  startButton: string[];
  startButtonOpen: string[];
  taskbar: string[];
  systemTray: string[];
}

const baseStartButtonClass = 'start-button-base';

export const THEME_STYLES: Record<ThemeId, ThemeStyleConfig> = {
  webos: {
    body: ['theme-webos'],
    startButton: [baseStartButtonClass, 'start-button-webos'],
    startButtonOpen: [baseStartButtonClass, 'start-button-webos', 'start-button--open'],
    taskbar: ['theme-webos', 'taskbar-webos', 'text-white'],
    systemTray: ['system-tray-webos'],
  },
  'win-xp': {
    body: ['theme-win-xp'],
    startButton: [baseStartButtonClass, 'start-button-win-xp'],
    startButtonOpen: [baseStartButtonClass, 'start-button-win-xp', 'start-button--open'],
    taskbar: ['theme-win-xp', 'taskbar-win-xp', 'text-white'],
    systemTray: ['system-tray-win-xp'],
  },
  win7: {
    body: ['theme-win7'],
    startButton: [baseStartButtonClass, 'start-button-win7'],
    startButtonOpen: [baseStartButtonClass, 'start-button-win7', 'start-button--open'],
    taskbar: ['theme-win7', 'taskbar-win7', 'text-white'],
    systemTray: ['system-tray-win7'],
  },
  win11: {
    body: ['theme-win11', 'theme-win7'],
    startButton: [baseStartButtonClass, 'start-button-win7'],
    startButtonOpen: [baseStartButtonClass, 'start-button-win7', 'start-button--open'],
    taskbar: ['theme-win11', 'theme-win7', 'taskbar-win7', 'text-black'],
    systemTray: ['system-tray-win7'],
  },
  win10: {
    body: ['theme-win10', 'theme-win7'],
    startButton: [baseStartButtonClass, 'start-button-win7'],
    startButtonOpen: [baseStartButtonClass, 'start-button-win7', 'start-button--open'],
    taskbar: ['theme-win10', 'theme-win7', 'taskbar-win7', 'text-white'],
    systemTray: ['system-tray-win7'],
  },
  vista: {
    body: ['theme-vista', 'theme-win7'],
    startButton: [baseStartButtonClass, 'start-button-win7', 'start-button-vista'],
    startButtonOpen: [baseStartButtonClass, 'start-button-win7', 'start-button-vista', 'start-button--open'],
    taskbar: ['theme-vista', 'theme-win7', 'taskbar-win7', 'taskbar-vista', 'text-white'],
    systemTray: ['system-tray-win7', 'system-tray-vista'],
  },
  'win-98': {
    body: ['theme-98'],
    startButton: ['start-button-98'],
    startButtonOpen: ['start-button-98'],
    taskbar: ['theme-98', 'taskbar-98', 'text-black'],
    systemTray: ['system-tray-98'],
  },
  win2000: {
    body: ['theme-win2000', 'theme-98'],
    startButton: ['start-button-98', 'start-button-2000'],
    startButtonOpen: ['start-button-98', 'start-button-2000'],
    taskbar: ['theme-win2000', 'theme-98', 'taskbar-98', 'text-black'],
    systemTray: ['system-tray-98'],
  },
};
