import { type ThemeId } from '../../../contexts/appContextTypes';
import { getOsDeviceSupportRules, getOsSkinRules, getOsVersionRules } from '../../os/osSkins';

export interface DesktopOsAttributes {
  'data-os-theme': string;
  'data-os-class': string;
  'data-os-version'?: string;
  'data-design-era'?: string;
  'data-device-family'?: string;
  'data-representative-device'?: string;
  'data-support-cycle'?: string;
  'data-form-factor'?: string;
}

export function getDesktopOsAttributes(themeId: ThemeId): DesktopOsAttributes {
  const skinRules = getOsSkinRules(themeId);
  const versionRules = getOsVersionRules(themeId);
  const deviceRules = getOsDeviceSupportRules(themeId);

  return {
    'data-os-theme': themeId,
    'data-os-class': skinRules.osClassName,
    'data-os-version': versionRules?.version,
    'data-design-era': versionRules?.designEra,
    'data-device-family': deviceRules?.deviceFamily,
    'data-representative-device': deviceRules?.representativeDevice,
    'data-support-cycle': deviceRules?.supportCycleLabel,
    'data-form-factor': deviceRules?.formFactor,
  };
}
