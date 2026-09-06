import { type ThemeId } from '../../contexts/appContextTypes';
import { type Language } from '../../i18n/translations';
import {
  DEFAULT_IOS_TOUCH_METADATA,
  DEFAULT_MOUSE_TOUCH_METADATA,
} from '../../system/integrations/shellIntegrations';
import {
  type OsBootRules,
  type OsDeviceSupportRules,
  type OsLoginRules,
  type OsSkinRules,
  type OsStartMenuRules,
  type OsSystemLabels,
  type OsTaskbarRules,
  type OsVersionRules,
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

  'ios-26': {
    theme: 'ios-26',
    osClassName: 'os-ios os-ios-modern os-ios-26',
    displayName: 'iOS 26.6.1',
    appNames: {
      pictures: { title: { en: 'Photos', ru: 'Фото' } },
      'control-panel': { title: { en: 'Settings', ru: 'Настройки' } },
      'internet-explorer': { title: { en: 'Safari', ru: 'Safari' } },
      notepad: { title: { en: 'Notes', ru: 'Заметки' } },
    },
    systemLabels: {
      startButton: { en: 'App Library', ru: 'Библиотека' },
      myComputer: { en: 'Files', ru: 'Файлы' },
      recycleBin: { en: 'Recently Deleted', ru: 'Недавно удаленные' },
    },
    osVersion: {
      displayName: 'iOS 26.6.1',
      family: 'iOS',
      version: 'iOS 26.6.1',
      designEra: 'modern',
      sourceStatus: 'user-requested',
      needsVerification: true,
      note: 'UI display label requested as iOS 26.6.1; official Apple security page currently documented iOS/iPadOS 26.6.',
    },
    deviceSupport: {
      formFactor: 'tablet',
      deviceFamily: 'iPad',
      representativeDevice: 'iPad Pro / iPad Air modern support cycle',
      supportedDevicesSummary:
        'iPadOS 26 compatible iPads, e.g. iPad 8th generation and later, iPad Air 3rd generation and later, iPad mini 5th generation and later, iPad Pro 11-inch 1st generation and later, iPad Pro 12.9-inch 3rd generation and later',
      supportCycleLabel: 'Modern iPadOS 26 support cycle',
      lastSupportedOs: 'iOS 26.6.1',
      lastSupportedOsNote:
        'Display label requested; verify exact patch availability before treating as official.',
    },
    homeScreen: {
      layout: 'ipad-home-grid',
      dockStyle: 'ios-modern-blur',
      iconShape: 'ios-modern-rounded',
      statusBarStyle: 'ios-modern',
    },
    touchMetadata: DEFAULT_IOS_TOUCH_METADATA,
  },

  'ios-16': {
    theme: 'ios-16',
    osClassName: 'os-ios os-ios-16',
    displayName: 'iOS 16.7.16',
    appNames: {
      pictures: { title: { en: 'Photos', ru: 'Фото' } },
      'control-panel': { title: { en: 'Settings', ru: 'Настройки' } },
      'internet-explorer': { title: { en: 'Safari', ru: 'Safari' } },
      notepad: { title: { en: 'Notes', ru: 'Заметки' } },
    },
    systemLabels: {
      startButton: { en: 'Home', ru: 'Домой' },
      myComputer: { en: 'Files', ru: 'Файлы' },
      recycleBin: { en: 'Recently Deleted', ru: 'Недавно удаленные' },
    },
    osVersion: {
      displayName: 'iOS 16.7.16',
      family: 'iOS',
      version: 'iOS 16.7.16',
      designEra: 'flat',
      sourceStatus: 'apple-documented',
    },
    deviceSupport: {
      formFactor: 'tablet',
      deviceFamily: 'iPad',
      representativeDevice:
        'iPad 5th generation / iPad Pro 9.7-inch / iPad Pro 12.9-inch 1st generation',
      supportedDevicesSummary:
        'iOS/iPadOS 16.7.16 security update available for iPad 5th generation, iPad Pro 9.7-inch, and iPad Pro 12.9-inch 1st generation',
      supportCycleLabel: 'Legacy iPadOS 16 security support cycle',
      lastSupportedOs: 'iOS 16.7.16',
    },
    homeScreen: {
      layout: 'ipad-home-grid',
      dockStyle: 'ios-flat-blur',
      iconShape: 'ios-flat-rounded',
      statusBarStyle: 'ios-flat',
    },
    touchMetadata: DEFAULT_IOS_TOUCH_METADATA,
  },

  'ios-9': {
    theme: 'ios-9',
    osClassName: 'os-ios os-ios-9',
    displayName: 'iOS 9.3.6',
    appNames: {
      pictures: { title: { en: 'Photos', ru: 'Фото' } },
      'control-panel': { title: { en: 'Settings', ru: 'Настройки' } },
      'internet-explorer': { title: { en: 'Safari', ru: 'Safari' } },
      notepad: { title: { en: 'Notes', ru: 'Заметки' } },
    },
    systemLabels: {
      startButton: { en: 'Home', ru: 'Домой' },
      myComputer: { en: 'Files', ru: 'Файлы' },
      recycleBin: { en: 'Trash', ru: 'Корзина' },
    },
    osVersion: {
      displayName: 'iOS 9.3.6',
      family: 'iOS',
      version: 'iOS 9.3.6',
      designEra: 'transitional-flat',
      sourceStatus: 'apple-documented',
    },
    deviceSupport: {
      formFactor: 'tablet',
      deviceFamily: 'iPad',
      representativeDevice: 'iPad 3rd generation Cellular / iPad 2 Cellular era',
      supportedDevicesSummary:
        'iOS 9.3.6 GPS/date fix support cycle for older cellular iPad/iPhone models',
      supportCycleLabel: 'iOS 9 legacy cellular GPS/date support cycle',
      lastSupportedOs: 'iOS 9.3.6',
      lastSupportedOsNote: 'GPS/date issue fix for affected devices',
    },
    homeScreen: {
      layout: 'ipad-home-grid',
      dockStyle: 'ios-flat-blur',
      iconShape: 'ios-flat-rounded',
      statusBarStyle: 'ios-flat',
    },
    touchMetadata: DEFAULT_IOS_TOUCH_METADATA,
  },

  'ios-5': {
    theme: 'ios-5',
    osClassName: 'os-ios os-ios-5',
    displayName: 'iOS 5.1.1',
    appNames: {
      pictures: { title: { en: 'Photos', ru: 'Фото' } },
      'control-panel': { title: { en: 'Settings', ru: 'Настройки' } },
      'internet-explorer': { title: { en: 'Safari', ru: 'Safari' } },
      notepad: { title: { en: 'Notes', ru: 'Заметки' } },
    },
    systemLabels: {
      startButton: { en: 'Home', ru: 'Домой' },
      myComputer: { en: 'Files', ru: 'Файлы' },
      recycleBin: { en: 'Trash', ru: 'Корзина' },
    },
    osVersion: {
      displayName: 'iOS 5.1.1',
      family: 'iOS',
      version: 'iOS 5.1.1',
      designEra: 'skeuomorphic',
      sourceStatus: 'apple-documented',
    },
    deviceSupport: {
      formFactor: 'tablet',
      deviceFamily: 'iPad',
      representativeDevice: 'iPad 1st generation / iPad 2',
      supportedDevicesSummary: 'iOS 5.1.1 available for original iPad and iPad 2',
      supportCycleLabel: 'Original iPad skeuomorphic iOS support cycle',
      lastSupportedOs: 'iOS 5.1.1',
    },
    homeScreen: {
      layout: 'ipad-home-grid',
      dockStyle: 'ios-old-glass',
      iconShape: 'ios-old-rounded',
      statusBarStyle: 'ios-old',
    },
    touchMetadata: DEFAULT_IOS_TOUCH_METADATA,
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
    appNames: {
      pictures: { title: { en: 'Visual Viewer', ru: 'Просмотр графики' } },
      'control-panel': { title: { en: 'System Settings', ru: 'Параметры системы' } },
      'internet-explorer': { title: { en: 'Web Browser', ru: 'Веб-браузер' } },
      notepad: { title: { en: 'Text Editor', ru: 'Текстовый редактор' } },
    },
    systemLabels: {
      startButton: { en: 'Applications', ru: 'Приложения' },
      myComputer: { en: 'System Root', ru: 'Корень системы' },
      recycleBin: { en: 'Trash', ru: 'Корзина' },
    },
    osVersion: {
      displayName: 'Arch Linux (Rolling)',
      family: 'Linux',
      version: 'Rolling Release',
      designEra: 'modern-linux',
      sourceStatus: 'community-documented',
    },
    deviceSupport: {
      formFactor: 'desktop',
      deviceFamily: 'x86_64 PC',
      representativeDevice: 'Custom Workstation / ThinkPad',
      supportedDevicesSummary: 'Arch Linux rolling release for 64-bit systems',
      supportCycleLabel: 'Continuous rolling release support cycle',
    },
    boot: {
      splashTitle: { en: 'Arch Linux', ru: 'Arch Linux' },
      bootAnimation: 'instant',
    },
    login: {
      welcomeText: { en: 'Arch Linux Terminal', ru: 'Терминал Arch Linux' },
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

  halloween: {
    theme: 'halloween',
    osClassName: 'os-spooky',
    displayName: 'Halloween Edition',
    appNames: {
      pictures: { title: { en: 'Spooky Gallery', ru: 'Жуткая галерея' } },
      'control-panel': { title: { en: 'Ghostly Settings', ru: 'Призрачные настройки' } },
      'internet-explorer': { title: { en: 'Web Cauldron', ru: 'Веб-котел' } },
      notepad: { title: { en: 'Grimoire', ru: 'Гримуар' } },
    },
    systemLabels: {
      startButton: { en: 'Trick or Treat', ru: 'Сладость или пакость' },
      myComputer: { en: 'Haunted Drive', ru: 'Призрачный диск' },
      recycleBin: { en: 'Graveyard', ru: 'Кладбище' },
    },
    osVersion: {
      displayName: 'Halloween Edition',
      family: 'Seasonal',
      version: 'Spooky 2026',
      designEra: 'seasonal-dark',
      sourceStatus: 'custom-theme',
    },
    deviceSupport: {
      formFactor: 'desktop',
      deviceFamily: 'Seasonal Edition',
      representativeDevice: 'Pumpkin Workstation',
      supportedDevicesSummary: 'Special seasonal Halloween layout',
      supportCycleLabel: 'October seasonal event cycle',
    },
    boot: {
      splashTitle: { en: 'Halloween Edition', ru: 'Halloween Edition' },
      bootAnimation: 'instant',
    },
    login: {
      welcomeText: { en: 'Welcome to Spooky Shell', ru: 'Добро пожаловать в Жуткую Оболочку' },
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

export function getOsVersionRules(theme: ThemeId): OsVersionRules | undefined {
  return getOsSkinRules(theme).osVersion;
}

export function getOsDeviceSupportRules(theme: ThemeId): OsDeviceSupportRules | undefined {
  return getOsSkinRules(theme).deviceSupport;
}

export function getOsTouchMetadata(theme: ThemeId) {
  return getOsSkinRules(theme).touchMetadata ?? DEFAULT_MOUSE_TOUCH_METADATA;
}
