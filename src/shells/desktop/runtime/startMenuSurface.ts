import { type ThemeId } from '../../../contexts/appContextTypes';
import { type Language } from '../../../i18n/translations';
import { getOsSkinRules, getOsSystemLabel } from '../../os/osSkins';

export type StartMenuVariant =
  | 'xp'
  | 'classic'
  | 'aero'
  | 'ubuntu'
  | 'webos'
  | 'ios'
  | 'arch'
  | 'halloween';

export type OsFamily = 'windows' | 'linux' | 'apple' | 'webos' | 'seasonal';

export interface StartMenuSurfaceInfo {
  variant: StartMenuVariant;
  osFamily: OsFamily;
  startLabel: string;
  className: string;
  dataAttributes: {
    'data-os-theme': string;
    'data-os-class': string;
    'data-start-variant': StartMenuVariant;
    'data-os-family': OsFamily;
  };
}

export function getStartMenuSurface(themeId: ThemeId, language: Language = 'en'): StartMenuSurfaceInfo {
  const skinRules = getOsSkinRules(themeId);
  const osClassName = skinRules.osClassName;

  let variant: StartMenuVariant = 'webos';
  let osFamily: OsFamily = 'windows';

  if (themeId === 'win-98') {
    variant = 'classic';
    osFamily = 'windows';
  } else if (themeId === 'win-xp') {
    variant = 'xp';
    osFamily = 'windows';
  } else if (themeId === 'win7' || themeId === 'win10' || themeId === 'win11') {
    variant = 'aero';
    osFamily = 'windows';
  } else if (themeId === 'ubuntu') {
    variant = 'ubuntu';
    osFamily = 'linux';
  } else if (themeId === 'arch') {
    variant = 'arch';
    osFamily = 'linux';
  } else if (themeId === 'halloween') {
    variant = 'halloween';
    osFamily = 'seasonal';
  } else if (themeId.startsWith('ios')) {
    variant = 'ios';
    osFamily = 'apple';
  } else {
    variant = 'webos';
    osFamily = 'webos';
  }

  const startLabel = getOsSystemLabel('startButton', 'Start', themeId, language);

  return {
    variant,
    osFamily,
    startLabel,
    className: `start-menu-surface start-menu-${variant} ${osClassName}`,
    dataAttributes: {
      'data-os-theme': themeId,
      'data-os-class': osClassName,
      'data-start-variant': variant,
      'data-os-family': osFamily,
    },
  };
}
