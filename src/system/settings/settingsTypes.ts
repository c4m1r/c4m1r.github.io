import { type Language } from '../../i18n/translations';

export interface SystemSettings {
  version: 1;
  language: Language;
  effects: {
    fireworksEnabled: boolean;
    weatherEffectsEnabled?: boolean;
    soundEffectsEnabled?: boolean;
  };
  ui: {
    rememberLastOs: boolean; // metadata/reserved setting (default false)
    lastOsProfileId?: string | null; // metadata/reserved setting
  };
  perOs?: Record<
    string,
    {
      showFrozenSettings?: boolean;
      reducedMotion?: boolean;
    }
  >;
}

export interface SettingsStorageAdapter {
  read(): SystemSettings | null;
  write(settings: SystemSettings): void;
  reset(): void;
}
