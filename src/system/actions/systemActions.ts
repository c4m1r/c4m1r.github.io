import { resetSystemSettings } from '../settings/settingsStore';
import {
  type SystemAction,
  type SystemActionContext,
  type SystemActionId,
} from './systemActionTypes';

export const systemActionsRegistry: Record<SystemActionId, SystemAction> = {
  'language.toggle': {
    id: 'language.toggle',
    label: {
      en: 'Switch Language (EN/RU)',
      ru: 'Переключить язык (RU/EN)',
    },
    enabled: true,
    run: (context: SystemActionContext) => {
      const nextLang = context.language === 'ru' ? 'en' : 'ru';
      if (context.setLanguage) {
        context.setLanguage(nextLang);
      }
      context.updateSettings({ language: nextLang });
    },
  },

  'effects.fireworks': {
    id: 'effects.fireworks',
    label: {
      en: 'Trigger System Fireworks',
      ru: 'Запустить салют',
    },
    enabled: true,
    run: (context: SystemActionContext) => {
      if (context.triggerEffect) {
        context.triggerEffect('fireworks');
      } else if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('trigger-system-effect', { detail: 'fireworks' })
        );
      }
    },
  },

  'effects.toggleFireworks': {
    id: 'effects.toggleFireworks',
    label: {
      en: 'Toggle Fireworks Effect',
      ru: 'Переключить визуальный салют',
    },
    enabled: true,
    run: (context: SystemActionContext) => {
      const current = context.settings.effects.fireworksEnabled;
      context.updateSettings((prev) => ({
        ...prev,
        effects: {
          ...prev.effects,
          fireworksEnabled: !current,
        },
      }));
    },
  },

  'settings.open': {
    id: 'settings.open',
    label: {
      en: 'Open System Settings',
      ru: 'Открыть настройки системы',
    },
    enabled: true,
    run: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-system-settings'));
      }
    },
  },

  'settings.reset': {
    id: 'settings.reset',
    label: {
      en: 'Reset System Settings',
      ru: 'Сбросить настройки системы',
    },
    enabled: true,
    run: (context: SystemActionContext) => {
      resetSystemSettings();
      if (context.setLanguage) {
        context.setLanguage('ru');
      }
    },
  },

  'about.open': {
    id: 'about.open',
    label: {
      en: 'About System',
      ru: 'О системе',
    },
    enabled: true,
    run: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-system-about'));
      }
    },
  },
};

export function getSystemActions(): SystemAction[] {
  return Object.values(systemActionsRegistry);
}

export function executeSystemAction(
  actionId: SystemActionId,
  context: SystemActionContext
): void {
  const action = systemActionsRegistry[actionId];
  if (action && action.enabled) {
    action.run(context);
  }
}
