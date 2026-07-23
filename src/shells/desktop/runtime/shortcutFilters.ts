import { type ThemeId } from '../../../contexts/appContextTypes';
import { OS_CLASS_MAP } from '../desktopConstants';

export function getDesktopOsClassName(theme: ThemeId): string {
  return OS_CLASS_MAP[theme] ?? 'classic';
}

export function isThemeInFamily(theme: ThemeId, family: readonly ThemeId[]): boolean {
  return family.includes(theme);
}
