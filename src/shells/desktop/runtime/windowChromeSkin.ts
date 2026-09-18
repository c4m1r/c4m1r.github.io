import { type ThemeId } from '../../../contexts/appContextTypes';
import { getOsSkinRules } from '../../os/osSkins';

export interface WindowChromeSkinInfo {
  skinName: string;
  className: string;
  dataAttributes: {
    'data-os-theme': string;
    'data-window-skin': string;
  };
}

export function getWindowChromeSkin(themeId: ThemeId): WindowChromeSkinInfo {
  const skinRules = getOsSkinRules(themeId);
  const osClass = skinRules.osClassName || 'os-winxp';
  const skinName =
    themeId === 'macos-26'
      ? 'macos'
      : themeId.startsWith('ios-')
        ? 'ios'
        : (osClass.split(/\s+/).find((token) => token.startsWith('os-')) ?? 'os-winxp').slice(3);

  return {
    skinName,
    className: `window-skin-${skinName} os-window-chrome-${skinName}`,
    dataAttributes: {
      'data-os-theme': themeId,
      'data-window-skin': skinName,
    },
  };
}
