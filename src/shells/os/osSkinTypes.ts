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

export interface OsBootRules {
  splashTitle?: Partial<Record<Language, string>>;
  bootAnimation?: 'bios' | 'splash' | 'instant';
  soundId?: string;
}

export interface OsLoginRules {
  welcomeText?: Partial<Record<Language, string>>;
  loginStyle?: 'classic' | 'xp' | 'modern';
  showUserTile?: boolean;
}

export interface OsStartMenuRules {
  menuStyle?: 'classic' | 'xp-two-column' | 'modern-yaru';
  pinnedAppIds?: string[];
  showUserTile?: boolean;
}

export interface OsTaskbarRules {
  startButtonLabel?: Partial<Record<Language, string>>;
  startButtonMode?: 'text' | 'orb' | 'menu';
  density?: 'classic' | 'xp' | 'glass' | 'linux';
  taskbarPosition?: 'bottom' | 'top';
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
  boot?: OsBootRules;
  login?: OsLoginRules;
  startMenu?: OsStartMenuRules;
  taskbar?: OsTaskbarRules;
  desktop?: OsDesktopRules;
}
