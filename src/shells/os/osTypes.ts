import { type AppMode, type ThemeId } from '../../contexts/appContextTypes';

export type BootProfileKind = 'site' | 'terminal' | 'desktop';

export type OsProfileId =
  | 'site'
  | 'terminal'
  | 'win-xp'
  | 'win-98'
  | 'win2000'
  | 'win7'
  | 'vista'
  | 'win8'
  | 'win10'
  | 'win11'
  | 'win95'
  | 'server2003'
  | 'server2008'
  | 'server2012'
  | 'server2016'
  | 'server2019'
  | 'ubuntu'
  | 'webos'
  | 'macos-26'
  | 'ios-26'
  | 'ios-16'
  | 'ios-9'
  | 'ios-5'
  | 'arch'
  | 'halloween';

/** Submenus of the boot menu. Profiles without a group sit at the top level. */
export type BootMenuGroup = 'windows' | 'unix' | 'macos' | 'mobile';

export interface OsBootProfile {
  id: OsProfileId;
  label: string;
  description?: string;
  kind: BootProfileKind;
  mode: AppMode;
  theme?: ThemeId;
  order: number;
  enabled: boolean;
  defaultSelected?: boolean;
  /** Placeholder entry: shown in the boot menu with a draft marker until its skin is complete. */
  draft?: boolean;
  /** Submenu the entry is listed under in the boot menu. */
  group?: BootMenuGroup;
}
