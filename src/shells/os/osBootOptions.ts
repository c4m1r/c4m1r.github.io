import { type ThemeId } from '../../contexts/appContextTypes';

export interface WindowsBuildWatermark {
  productName: string;
  build: string;
}

/** Optional Windows desktop build text controlled from GRUB. */
export const WINDOWS_BUILD_WATERMARKS: Partial<Record<ThemeId, WindowsBuildWatermark>> = {
  'win-98': { productName: 'Microsoft Windows 98', build: '4.10.1998' },
  'win-xp': { productName: 'Microsoft Windows XP', build: '2600' },
  win7: { productName: 'Windows 7', build: '7601' },
  win10: { productName: 'Windows 10', build: '19045' },
  win11: { productName: 'Windows 11', build: '26100' },
};

const BUILD_TEXT_STORAGE_PREFIX = 'webos:show-build-text:';

export function supportsWindowsBuildText(theme?: ThemeId): boolean {
  return Boolean(theme && WINDOWS_BUILD_WATERMARKS[theme]);
}

export function isWindowsBuildTextEnabled(theme?: ThemeId): boolean {
  if (!theme || !supportsWindowsBuildText(theme) || typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(`${BUILD_TEXT_STORAGE_PREFIX}${theme}`) === '1';
}

export function setWindowsBuildTextEnabled(theme: ThemeId, enabled: boolean): void {
  if (!supportsWindowsBuildText(theme) || typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(`${BUILD_TEXT_STORAGE_PREFIX}${theme}`, enabled ? '1' : '0');
}

export function getWindowsBuildWatermark(theme?: ThemeId): WindowsBuildWatermark | null {
  if (!theme) return null;
  return WINDOWS_BUILD_WATERMARKS[theme] ?? null;
}
