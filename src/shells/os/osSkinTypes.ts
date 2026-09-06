import { type ThemeId } from '../../contexts/appContextTypes';
import { type Language } from '../../i18n/translations';
import { type TouchAffordanceMetadata } from '../../system/integrations/shellIntegrationTypes';

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

export interface OsVersionRules {
  displayName?: string;
  family?: 'iOS' | 'iPadOS' | 'Windows' | 'Ubuntu' | 'WebOS' | 'Linux' | 'Seasonal';
  version?: string;
  designEra?: 'skeuomorphic' | 'transitional-flat' | 'flat' | 'modern' | 'modern-linux' | 'seasonal-dark';
  sourceStatus?: 'apple-documented' | 'user-requested' | 'estimated' | 'community-documented' | 'custom-theme';
  needsVerification?: boolean;
  note?: string;
}

export interface OsDeviceSupportRules {
  formFactor?: 'desktop' | 'tablet';
  deviceFamily?: string;
  representativeDevice?: string;
  supportedDevicesSummary?: string;
  supportCycleLabel?: string;
  lastSupportedOs?: string;
  lastSupportedOsNote?: string;
}

export interface OsHomeScreenRules {
  layout?: 'desktop' | 'ipad-home-grid';
  dockStyle?: 'ios-old-glass' | 'ios-flat-blur' | 'ios-modern-blur';
  iconShape?: 'ios-old-rounded' | 'ios-flat-rounded' | 'ios-modern-rounded';
  statusBarStyle?: 'ios-old' | 'ios-flat' | 'ios-modern';
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
  osVersion?: OsVersionRules;
  deviceSupport?: OsDeviceSupportRules;
  homeScreen?: OsHomeScreenRules;
  touchMetadata?: TouchAffordanceMetadata;
}
