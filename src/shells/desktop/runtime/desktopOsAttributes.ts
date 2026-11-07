import { type ThemeId } from '../../../contexts/appContextTypes';
import { getOsDeviceSupportRules, getOsSkinRules, getOsVersionRules } from '../../os/osSkins';
import { getWindowsBuildWatermark, isWindowsBuildTextEnabled } from '../../os/osBootOptions';
import { getActiveEdition } from '../../os/osEditions';

export interface DesktopOsAttributes {
  'data-os-theme': string;
  'data-os-class': string;
  'data-os-version'?: string;
  'data-design-era'?: string;
  'data-device-family'?: string;
  'data-representative-device'?: string;
  'data-support-cycle'?: string;
  'data-form-factor'?: string;
  'data-build-watermark'?: string;
}

export function getDesktopOsAttributes(themeId: ThemeId): DesktopOsAttributes {
  const skinRules = getOsSkinRules(themeId);
  const versionRules = getOsVersionRules(themeId);
  const deviceRules = getOsDeviceSupportRules(themeId);
  const buildWatermark = getWindowsBuildWatermark(themeId);
  const showBuildText = isWindowsBuildTextEnabled(themeId);
  const activeEdition = getActiveEdition(themeId);

  let watermarkText: string | undefined;
  if (showBuildText && buildWatermark) {
    const editionSuffix = activeEdition ? ` ${activeEdition.label}` : '';
    const buildInfo = activeEdition?.buildNumber ?? `Build ${buildWatermark.build}`;
    watermarkText = `${buildWatermark.productName}${editionSuffix}\n${buildInfo}`;
  }

  return {
    'data-os-theme': themeId,
    'data-os-class': skinRules.osClassName,
    'data-os-version': versionRules?.version,
    'data-design-era': versionRules?.designEra,
    'data-device-family': deviceRules?.deviceFamily,
    'data-representative-device': deviceRules?.representativeDevice,
    'data-support-cycle': deviceRules?.supportCycleLabel,
    'data-form-factor': deviceRules?.formFactor,
    'data-build-watermark': watermarkText,
  };
}
