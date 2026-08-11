import { type ThemeId } from '../../contexts/appContextTypes';
import { type Language } from '../../i18n/translations';
import {
  type OsBootRules,
  type OsLoginRules,
  type OsSkinRules,
  type OsStartMenuRules,
  type OsSystemLabels,
  type OsTaskbarRules,
} from './osSkinTypes';

const PROTECTED_CONTENT_APP_IDS = new Set([
  'my-cv',
  'projects-grid',
  'blog',
  'wiki',
  'about',
  'content-reader',
]);

export const osSkinRules: Record<ThemeId, OsSkinRules> = {
  'win-xp': {
    theme: 'win-xp',
    osClassName: 'os-winxp',
    displayName: 'Windows XP',
    appNames: {
      pictures: { title: { en: 'My Pictures', ru: 'Мои рисунки' } },
      'control-panel': { title: { en: 'Control Panel', ru: 'Панель управления' } },
      'internet-explorer': { title: { en: 'Internet Explorer', ru: 'Internet Explorer' } },
      notepad: { title: { en: 'Notepad', ru: 'Блокнот' } },
    },
    systemLabels: {
      startButton: { en: 'start', ru: 'пуск' },
      myComputer: { en: 'My Computer', ru: 'Мой компьютер' },
      recycleBin: { en: 'Recycle Bin', ru: 'Корзина' },
    },
    boot: {
      splashTitle: { en: 'Windows XP Professional', ru: 'Windows XP Professional' },
      bootAnimation: 'splash',
    },
    login: {
      welcomeText: { en: 'Welcome', ru: 'Добро пожаловать' },
      loginStyle: 'xp',
      showUserTile: true,
    },
    startMenu: {
      menuStyle: 'xp-two-column',
      showUserTile: true,
      pinnedAppIds: ['internet-explorer', 'outlook', 'windows-media-player', 'paint'],
    },
    taskbar: {
      startButtonMode: 'text',
      density: 'xp',
    },
    desktop: {
      iconLabelStyle: 'xp',
      systemIconStyle: 'xp',
    },
  },

  'win-98': {
    theme: 'win-98',
    osClassName: 'os-classic',
    displayName: 'Windows 98',
    appNames: {
      pictures: { title: { en: 'My Pictures', ru: 'Мои рисунки' } },
      'control-panel': { title: { en: 'Control Panel', ru: 'Панель управления' } },
      'internet-explorer': { title: { en: 'Internet Explorer', ru: 'Internet Explorer' } },
      notepad: { title: { en: 'Notepad', ru: 'Блокнот' } },
    },
    systemLabels: {
      startButton: { en: 'Start', ru: 'Пуск' },
      myComputer: { en: 'My Computer', ru: 'Мой компьютер' },
      recycleBin: { en: 'Recycle Bin', ru: 'Корзина' },
    },
    boot: {
      splashTitle: { en: 'Windows 98', ru: 'Windows 98' },
      bootAnimation: 'splash',
    },
    login: {
      welcomeText: { en: 'Welcome to Windows', ru: 'Добро пожаловать в Windows' },
      loginStyle: 'classic',
      showUserTile: false,
    },
    startMenu: {
      menuStyle: 'classic',
      showUserTile: false,
      pinnedAppIds: ['internet-explorer', 'notepad', 'calculator', 'paint'],
    },
    taskbar: {
      startButtonMode: 'text',
      density: 'classic',
    },
    desktop: {
      iconLabelStyle: 'classic',
      systemIconStyle: 'classic',
    },
  },

  win7: {
    theme: 'win7',
    osClassName: 'os-win7',
    displayName: 'Windows 7',
    appNames: {
      pictures: { title: { en: 'Pictures', ru: 'Изображения' } },
      'control-panel': { title: { en: 'Control Panel', ru: 'Панель управления' } },
      'internet-explorer': { title: { en: 'Internet Explorer', ru: 'Internet Explorer' } },
      notepad: { title: { en: 'Notepad', ru: 'Блокнот' } },
    },
    systemLabels: {
      startButton: { en: 'Start', ru: 'Пуск' },
      myComputer: { en: 'Computer', ru: 'Компьютер' },
      recycleBin: { en: 'Recycle Bin', ru: 'Корзина' },
    },
    boot: {
      splashTitle: { en: 'Starting Windows', ru: 'Запуск Windows' },
      bootAnimation: 'splash',
    },
    login: {
      welcomeText: { en: 'Welcome', ru: 'Добро пожаловать' },
      loginStyle: 'modern',
      showUserTile: true,
    },
    startMenu: {
      menuStyle: 'xp-two-column',
      showUserTile: true,
      pinnedAppIds: ['internet-explorer', 'pictures', 'control-panel', 'notepad'],
    },
    taskbar: {
      startButtonMode: 'orb',
      density: 'glass',
    },
    desktop: {
      iconLabelStyle: 'glass',
      systemIconStyle: 'glass',
    },
  },

  ubuntu: {
    theme: 'ubuntu',
    osClassName: 'os-ubuntu',
    displayName: 'Ubuntu',
    appNames: {
      pictures: { title: { en: 'Photos', ru: 'Фото' } },
      'control-panel': { title: { en: 'Settings', ru: 'Настройки' } },
      terminal: { title: { en: 'Terminal', ru: 'Терминал' } },
      'internet-explorer': { title: { en: 'Browser', ru: 'Браузер' } },
      notepad: { title: { en: 'Text Editor', ru: 'Текстовый редактор' } },
    },
    systemLabels: {
      startButton: { en: 'Menu', ru: 'Меню' },
      myComputer: { en: 'Files', ru: 'Файлы' },
      recycleBin: { en: 'Trash', ru: 'Корзина' },
    },
    boot: {
      splashTitle: { en: 'Ubuntu', ru: 'Ubuntu' },
      bootAnimation: 'splash',
    },
    login: {
      welcomeText: { en: 'Ubuntu Desktop', ru: 'Рабочий стол Ubuntu' },
      loginStyle: 'modern',
      showUserTile: true,
    },
    startMenu: {
      menuStyle: 'modern-yaru',
      showUserTile: true,
      pinnedAppIds: ['internet-explorer', 'terminal', 'control-panel', 'pictures'],
    },
    taskbar: {
      startButtonMode: 'menu',
      density: 'linux',
    },
    desktop: {
      iconLabelStyle: 'linux',
      systemIconStyle: 'linux',
    },
  },

  webos: {
    theme: 'webos',
    osClassName: 'os-shell',
    displayName: 'WebOS',
    appNames: {},
    systemLabels: {
      startButton: { en: 'Menu', ru: 'Меню' },
    },
    boot: {
      splashTitle: { en: 'WebOS', ru: 'WebOS' },
      bootAnimation: 'instant',
    },
    login: {
      welcomeText: { en: 'WebOS Desktop', ru: 'WebOS Desktop' },
      loginStyle: 'xp',
      showUserTile: false,
    },
    startMenu: {
      menuStyle: 'xp-two-column',
      showUserTile: false,
    },
    taskbar: {
      startButtonMode: 'text',
      density: 'xp',
    },
    desktop: {
      iconLabelStyle: 'xp',
      systemIconStyle: 'xp',
    },
  },

  win10: {
    theme: 'win10',
    osClassName: 'os-win10',
    displayName: 'Windows 10',
    appNames: {},
    systemLabels: {
      startButton: { en: 'Start', ru: 'Пуск' },
    },
  },

  win11: {
    theme: 'win11',
    osClassName: 'os-win11',
    displayName: 'Windows 11',
    appNames: {},
    systemLabels: {
      startButton: { en: 'Start', ru: 'Пуск' },
    },
  },

  arch: {
    theme: 'arch',
    osClassName: 'os-arch',
    displayName: 'Arch Linux',
    appNames: {},
    systemLabels: {
      startButton: { en: 'Applications', ru: 'Приложения' },
    },
  },

  halloween: {
    theme: 'halloween',
    osClassName: 'os-spooky',
    displayName: 'Halloween',
    appNames: {},
    systemLabels: {
      startButton: { en: 'Trick or Treat', ru: 'Сладость или пакость' },
    },
  },
};

export function getOsSkinRules(theme: ThemeId): OsSkinRules {
  return osSkinRules[theme] ?? osSkinRules.webos;
}

export function getOsAppTitle(
  appId: string,
  defaultTitle: Record<Language, string>,
  theme: ThemeId,
  language: Language
): string {
  if (PROTECTED_CONTENT_APP_IDS.has(appId)) {
    return defaultTitle[language] ?? defaultTitle.en ?? '';
  }

  const rules = getOsSkinRules(theme);
  const override = rules.appNames?.[appId]?.title;
  if (override) {
    const langTitle = override[language] ?? override.en;
    if (langTitle) return langTitle;
  }
  return defaultTitle[language] ?? defaultTitle.en ?? '';
}

export function getOsAppIconKey(
  appId: string,
  defaultIconKey: string | undefined,
  theme: ThemeId
): string | undefined {
  const rules = getOsSkinRules(theme);
  return rules.appNames?.[appId]?.iconKey ?? defaultIconKey;
}

export function getOsAppVisibility(
  appId: string,
  defaultVisible: boolean | undefined,
  theme: ThemeId,
  target: 'desktop' | 'startMenu'
): boolean {
  if (defaultVisible === false) {
    return false;
  }

  const rules = getOsSkinRules(theme);
  const appRule = rules.appNames?.[appId];

  const osOverride =
    target === 'desktop'
      ? appRule?.showOnDesktop
      : appRule?.showInStartMenu;

  return osOverride ?? defaultVisible ?? false;
}

export function getOsSystemLabel(
  key: keyof OsSystemLabels,
  fallback: string,
  theme: ThemeId,
  language: Language
): string {
  const rules = getOsSkinRules(theme);
  const override = rules.systemLabels?.[key];
  if (override) {
    const val = override[language] ?? override.en;
    if (val) return val;
  }
  return fallback;
}

export function getOsBootRules(theme: ThemeId): OsBootRules | undefined {
  return getOsSkinRules(theme).boot;
}

export function getOsLoginRules(theme: ThemeId): OsLoginRules | undefined {
  return getOsSkinRules(theme).login;
}

export function getOsStartMenuRules(theme: ThemeId): OsStartMenuRules | undefined {
  return getOsSkinRules(theme).startMenu;
}

export function getOsTaskbarRules(theme: ThemeId): OsTaskbarRules | undefined {
  return getOsSkinRules(theme).taskbar;
}
