import { type ThemeId } from '../../contexts/appContextTypes';
import { type Language } from '../../i18n/translations';
import { type SystemSettings } from '../settings/settingsTypes';

export type SystemActionId =
  | 'settings.open'
  | 'settings.reset'
  | 'language.toggle'
  | 'effects.fireworks'
  | 'effects.toggleFireworks'
  | 'about.open';

export interface SystemActionContext {
  theme?: ThemeId;
  language: Language;
  settings: SystemSettings;
  updateSettings: (
    partial: Partial<SystemSettings> | ((prev: SystemSettings) => SystemSettings)
  ) => SystemSettings;
  setLanguage?: (lang: Language) => void;
  triggerEffect?: (effectName: string) => void;
}

export interface SystemAction {
  id: SystemActionId;
  label: Partial<Record<Language, string>>;
  description?: Partial<Record<Language, string>>;
  iconKey?: string;
  enabled: boolean;
  run: (context: SystemActionContext) => void;
}
