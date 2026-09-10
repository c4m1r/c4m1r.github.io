import { type ThemeId } from '../../contexts/appContextTypes';

export interface WindowsBuildWatermark {
  productName: string;
  build: string;
}

/**
 * Canonical build identifiers used by the optional desktop build watermark.
 * The first three entries map to Windows versions currently exposed in GRUB.
 * Windows 10/11 are included because those themes already exist and can be
 * exposed as boot profiles without changing this feature later.
 */
export const WINDOWS_BUILD_WATERMARKS: Partial<Record<ThemeId, WindowsBuildWatermark>> = {
  'win-98': { productName: 'Windows 98', build: '1998' },
  'win-xp': { productName: 'Windows XP', build: '2600' },
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
