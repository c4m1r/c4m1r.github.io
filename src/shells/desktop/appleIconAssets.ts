import { type ThemeId } from '../../contexts/appContextTypes';

import macLaunchpadIcon from '../../themes/apple/assets/icons/launchpad.png';
import macSafariIcon from '../../themes/apple/assets/icons/safari.png';
import macTerminalIcon from '../../themes/apple/assets/icons/terminal.png';
import macSettingsIcon from '../../themes/apple/assets/icons/settings.svg';
import macPhotosIcon from '../../themes/apple/assets/icons/photos.png';
import macMailIcon from '../../themes/apple/assets/icons/mail.png';
import macMusicIcon from '../../themes/apple/assets/icons/music.png';
import macFolderGenericIcon from '../../themes/apple/assets/icons/folder-generic.png';
import macFinderIcon from '../../themes/apple/assets/icons/finder.png';
import macTrashIcon from '../../themes/apple/assets/icons/trash.webp';
import macNotesIcon from '../../themes/apple/assets/icons/notes.png';
import macCalendarIcon from '../../themes/apple/assets/icons/calendar.png';
import macCalculatorIcon from '../../themes/apple/assets/icons/calculator.png';

import iosSafariIcon from '../../themes/apple/assets/ios/Icon=Safari.png';
import iosMailIcon from '../../themes/apple/assets/ios/Icon=Mail.png';
import iosMusicIcon from '../../themes/apple/assets/ios/Icon=Music.png';
import iosFilesIcon from '../../themes/apple/assets/ios/Icon=Files.png';
import iosCalculatorIcon from '../../themes/apple/assets/ios/Icon=Calculator.png';
import iosSettingsIcon from '../../themes/apple/assets/ios/Icon=Settings.png';
import iosPhotosIcon from '../../themes/apple/assets/ios/Icon=Photos.png';
import iosNewsIcon from '../../themes/apple/assets/ios/Icon=News.png';
import iosNotesIcon from '../../themes/apple/assets/ios/Icon=Notes.png';

import ios9SafariIcon from '../../themes/apple/assets/ios9/safari.png';
import ios9SettingsIcon from '../../themes/apple/assets/ios9/settings.png';
import ios9PhotosIcon from '../../themes/apple/assets/ios9/gallery.png';
import ios9MusicIcon from '../../themes/apple/assets/ios9/itunes.png';
import ios9CalendarIcon from '../../themes/apple/assets/ios9/iconcal.png';

export interface AppleDockAsset {
  id: string;
  title: string;
  appId?: string;
  src?: string;
  glyph?: string;
  launcher?: boolean;
}

const MODERN_IOS_ICON_BY_ID: Readonly<Record<string, string>> = {
  'internet-explorer': iosSafariIcon,
  outlook: iosMailIcon,
  'windows-media-player': iosMusicIcon,
  winamp: iosMusicIcon,
  'projects-grid': iosFilesIcon,
  calculator: iosCalculatorIcon,
  'control-panel': iosSettingsIcon,
  pictures: iosPhotosIcon,
  blog: iosNewsIcon,
  news: iosNewsIcon,
  notepad: iosNotesIcon,
  'my-computer': iosFilesIcon,
};

const IOS9_ICON_BY_ID: Readonly<Record<string, string>> = {
  'internet-explorer': ios9SafariIcon,
  'windows-media-player': ios9MusicIcon,
  winamp: ios9MusicIcon,
  'control-panel': ios9SettingsIcon,
  pictures: ios9PhotosIcon,
  calendar: ios9CalendarIcon,
};

export const MACOS_SYSTEM_ICON_BY_ID: Readonly<Record<string, string>> = {
  'my-computer': macFinderIcon,
  'recycle-bin': macTrashIcon,
};

export const MACOS_APP_ICON_BY_ID: Readonly<Record<string, string>> = {
  'internet-explorer': macSafariIcon,
  outlook: macMailIcon,
  'windows-media-player': macMusicIcon,
  pictures: macPhotosIcon,
  'control-panel': macSettingsIcon,
  notepad: macNotesIcon,
  terminal: macTerminalIcon,
  calculator: macCalculatorIcon,
  calendar: macCalendarIcon,
  'projects-grid': macFolderGenericIcon,
};

export const MACOS_DOCK_ITEMS: readonly AppleDockAsset[] = [
  { id: 'finder', title: 'Finder', appId: 'my-computer', src: macFinderIcon },
  { id: 'launchpad', title: 'Launchpad', src: macLaunchpadIcon, launcher: true },
  { id: 'safari', title: 'Safari', appId: 'internet-explorer', src: macSafariIcon },
  { id: 'mail', title: 'Mail', appId: 'outlook', src: macMailIcon },
  { id: 'music', title: 'Music', appId: 'windows-media-player', src: macMusicIcon },
  { id: 'photos', title: 'Photos', appId: 'pictures', src: macPhotosIcon },
  { id: 'settings', title: 'System Settings', appId: 'control-panel', src: macSettingsIcon },
  { id: 'terminal', title: 'Terminal', appId: 'terminal', src: macTerminalIcon },
];

const MODERN_IOS_DOCK_ITEMS: readonly AppleDockAsset[] = [
  { id: 'safari', title: 'Safari', appId: 'internet-explorer', src: iosSafariIcon },
  { id: 'photos', title: 'Photos', appId: 'pictures', src: iosPhotosIcon },
  { id: 'notes', title: 'Notes', appId: 'notepad', src: iosNotesIcon },
  { id: 'settings', title: 'Settings', appId: 'control-panel', src: iosSettingsIcon },
];

const IOS9_DOCK_ITEMS: readonly AppleDockAsset[] = [
  { id: 'safari', title: 'Safari', appId: 'internet-explorer', src: ios9SafariIcon },
  { id: 'photos', title: 'Photos', appId: 'pictures', src: ios9PhotosIcon },
  { id: 'music', title: 'Music', appId: 'windows-media-player', src: ios9MusicIcon },
  { id: 'settings', title: 'Settings', appId: 'control-panel', src: ios9SettingsIcon },
];

const IOS5_DOCK_ITEMS: readonly AppleDockAsset[] = [
  { id: 'safari', title: 'Safari', appId: 'internet-explorer', glyph: '◎' },
  { id: 'photos', title: 'Photos', appId: 'pictures', glyph: '✿' },
  { id: 'notes', title: 'Notes', appId: 'notepad', glyph: '▤' },
  { id: 'settings', title: 'Settings', appId: 'control-panel', glyph: '⚙' },
];

export function getIosIconMap(theme: ThemeId): Readonly<Record<string, string>> {
  if (theme === 'ios-9') return IOS9_ICON_BY_ID;
  if (theme === 'ios-16' || theme === 'ios-26') return MODERN_IOS_ICON_BY_ID;
  return {};
}

export function getIosDockItems(theme: ThemeId): readonly AppleDockAsset[] {
  if (theme === 'ios-9') return IOS9_DOCK_ITEMS;
  if (theme === 'ios-5') return IOS5_DOCK_ITEMS;
  return MODERN_IOS_DOCK_ITEMS;
}
