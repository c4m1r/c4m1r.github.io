import { type ThemeId } from '../../contexts/appContextTypes';

export const OS_CLASS_MAP: Record<ThemeId, string> = {
  'win-xp': 'winxp',
  webos: 'winxp',
  'win-98': 'classic',
  win7: 'win7',
  win10: 'win7',
  win11: 'win7',
  ubuntu: 'ubuntu',
  arch: 'arch',
  halloween: 'spooky',
  'macos-26': 'macos os-macos-26',
  'ios-26': 'ios os-ios-modern os-ios-26',
  'ios-16': 'ios os-ios-16',
  'ios-9': 'ios os-ios-9',
  'ios-5': 'ios os-ios-5',
};

export function getOsClassName(theme: ThemeId): string {
  return OS_CLASS_MAP[theme] ?? 'classic';
}
