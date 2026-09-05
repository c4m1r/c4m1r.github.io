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
  const skinName = osClass.startsWith('os-') ? osClass.slice(3) : osClass;

  return {
    skinName,
    className: `window-skin-${skinName} os-window-chrome-${skinName}`,
    dataAttributes: {
      'data-os-theme': themeId,
      'data-window-skin': skinName,
    },
  };
}
