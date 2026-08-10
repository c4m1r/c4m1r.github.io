import { type AppMode, type ThemeId } from '../../contexts/appContextTypes';

export type BootProfileKind = 'site' | 'terminal' | 'desktop';

export type OsProfileId =
  | 'site'
  | 'terminal'
  | 'win-xp'
  | 'win-98'
  | 'win7'
  | 'ubuntu'
  | 'webos';

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
}
