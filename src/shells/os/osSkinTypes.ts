import { type ThemeId } from '../../contexts/appContextTypes';
import { type Language } from '../../i18n/translations';

export interface OsAppDisplayRule {
  title?: Partial<Record<Language, string>>;
  iconKey?: string;
  showOnDesktop?: boolean;
  showInStartMenu?: boolean;
  startMenuGroup?: string;
  taskbarTitle?: Partial<Record<Language, string>>;
}

export interface OsSystemLabels {
  startButton?: Partial<Record<Language, string>>;
  myComputer?: Partial<Record<Language, string>>;
  recycleBin?: Partial<Record<Language, string>>;
  documents?: Partial<Record<Language, string>>;
  pictures?: Partial<Record<Language, string>>;
  controlPanel?: Partial<Record<Language, string>>;
}

export interface OsTaskbarRules {
  startButtonLabel?: Partial<Record<Language, string>>;
  startButtonMode?: 'text' | 'orb' | 'menu';
  density?: 'classic' | 'xp' | 'glass' | 'linux';
}

export interface OsDesktopRules {
  iconLabelStyle?: 'classic' | 'xp' | 'glass' | 'linux';
  systemIconStyle?: 'classic' | 'xp' | 'glass' | 'linux';
}

export interface OsSkinRules {
  theme: ThemeId;
  osClassName: string;
  displayName: string;
  appNames?: Record<string, OsAppDisplayRule>;
  systemLabels?: OsSystemLabels;
  taskbar?: OsTaskbarRules;
  desktop?: OsDesktopRules;
}
