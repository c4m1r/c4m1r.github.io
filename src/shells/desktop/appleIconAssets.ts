import { type ThemeId } from '../../contexts/appContextTypes';

import macLaunchpadIcon from '../../../eat/playground-macos-main/public/img/icons/launchpad.png';
import macSafariIcon from '../../../eat/playground-macos-main/public/img/icons/safari.png';
import macTerminalIcon from '../../../eat/playground-macos-main/public/img/icons/terminal.png';
import macSettingsIcon from '../../../eat/macos-portfolio-main/public/icons/settings.svg';
import macPhotosIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/photos.png';
import macMailIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/mail.png';
import macMusicIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/music.png';
import macFolderGenericIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/folder-generic.png';
import macFinderIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/finder.png';
import macTrashIcon from '../../../eat/macos-portfolio-main/public/images/trash.webp';
import macNotesIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/notes.png';
import macCalendarIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/calendar.png';
import macCalculatorIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/calculator.png';

import iosSafariIcon from '../../../eat/homescreen-main/public/images/Icon=Safari.png';
import iosMailIcon from '../../../eat/homescreen-main/public/images/Icon=Mail.png';
import iosMusicIcon from '../../../eat/homescreen-main/public/images/Icon=Music.png';
import iosFilesIcon from '../../../eat/homescreen-main/public/images/Icon=Files.png';
import iosCalculatorIcon from '../../../eat/homescreen-main/public/images/Icon=Calculator.png';
import iosSettingsIcon from '../../../eat/homescreen-main/public/images/Icon=Settings.png';
import iosPhotosIcon from '../../../eat/homescreen-main/public/images/Icon=Photos.png';
import iosNewsIcon from '../../../eat/homescreen-main/public/images/Icon=News.png';
import iosNotesIcon from '../../../eat/homescreen-main/public/images/Icon=Notes.png';

import ios9SafariIcon from '../../../eat/Iphone-7-Html-Css-Js-main/assets/images/safari.png';
import ios9SettingsIcon from '../../../eat/Iphone-7-Html-Css-Js-main/assets/images/settings.png';
import ios9PhotosIcon from '../../../eat/Iphone-7-Html-Css-Js-main/assets/images/gallery.png';
import ios9MusicIcon from '../../../eat/Iphone-7-Html-Css-Js-main/assets/images/itunes.png';
import ios9CalendarIcon from '../../../eat/Iphone-7-Html-Css-Js-main/assets/images/iconcal.png';

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
