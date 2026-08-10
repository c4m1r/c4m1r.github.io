import { type ThemeId } from '../../contexts/appContextTypes';
import { type Language } from '../../i18n/translations';
import { type OsSkinRules, type OsSystemLabels } from './osSkinTypes';

export const osSkinRules: Record<ThemeId, OsSkinRules> = {
  'win-xp': {
    theme: 'win-xp',
    osClassName: 'os-winxp',
    displayName: 'Windows XP',
    appNames: {
      'my-cv': { title: { en: 'My Documents', ru: 'Мои документы' } },
      pictures: { title: { en: 'My Pictures', ru: 'Мои рисунки' } },
      'control-panel': { title: { en: 'Control Panel', ru: 'Панель управления' } },
      'internet-explorer': { title: { en: 'Internet Explorer', ru: 'Internet Explorer' } },
    },
    systemLabels: {
      startButton: { en: 'start', ru: 'пуск' },
      myComputer: { en: 'My Computer', ru: 'Мой компьютер' },
      recycleBin: { en: 'Recycle Bin', ru: 'Корзина' },
    },
  },

  'win-98': {
    theme: 'win-98',
    osClassName: 'os-classic',
    displayName: 'Windows 98',
    appNames: {
      'my-cv': { title: { en: 'My Documents', ru: 'Мои документы' } },
      pictures: { title: { en: 'My Pictures', ru: 'Мои рисунки' } },
      'control-panel': { title: { en: 'Control Panel', ru: 'Панель управления' } },
    },
    systemLabels: {
      startButton: { en: 'Start', ru: 'Пуск' },
      myComputer: { en: 'My Computer', ru: 'Мой компьютер' },
      recycleBin: { en: 'Recycle Bin', ru: 'Корзина' },
    },
  },

  win7: {
    theme: 'win7',
    osClassName: 'os-win7',
    displayName: 'Windows 7',
    appNames: {
      'my-cv': { title: { en: 'Documents', ru: 'Документы' } },
      pictures: { title: { en: 'Pictures', ru: 'Изображения' } },
      'control-panel': { title: { en: 'Control Panel', ru: 'Панель управления' } },
    },
    systemLabels: {
      startButton: { en: 'Start', ru: 'Пуск' },
      myComputer: { en: 'Computer', ru: 'Компьютер' },
      recycleBin: { en: 'Recycle Bin', ru: 'Корзина' },
    },
  },

  ubuntu: {
    theme: 'ubuntu',
    osClassName: 'os-ubuntu',
    displayName: 'Ubuntu',
    appNames: {
      'my-cv': { title: { en: 'Files', ru: 'Файлы' } },
      pictures: { title: { en: 'Photos', ru: 'Фото' } },
      'control-panel': { title: { en: 'Settings', ru: 'Настройки' } },
      terminal: { title: { en: 'Terminal', ru: 'Терминал' } },
      'internet-explorer': { title: { en: 'Browser', ru: 'Браузер' } },
    },
    systemLabels: {
      startButton: { en: 'Activities', ru: 'Обзор' },
      myComputer: { en: 'Files', ru: 'Файлы' },
      recycleBin: { en: 'Trash', ru: 'Корзина' },
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
  const rules = getOsSkinRules(theme);
  const rule = rules.appNames?.[appId];
  if (target === 'desktop' && rule?.showOnDesktop !== undefined) {
    return rule.showOnDesktop;
  }
  if (target === 'startMenu' && rule?.showInStartMenu !== undefined) {
    return rule.showInStartMenu;
  }
  return defaultVisible ?? true;
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
