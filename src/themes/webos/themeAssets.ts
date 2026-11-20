// WebOS assets - используем assets из winxp темы
import folderPlainWebos from '../winxp/assets/icons/folder_plain.png';
import myComputerWebos from '../winxp/assets/icons/mycomputer.png';
import recycleBinWebos from '../winxp/assets/icons/recycling_bin.png';
import folderDocumentsWebos from '../winxp/assets/icons/folder-documents.png';
import folderPicturesWebos from '../winxp/assets/icons/folder-pictures.png';
import folderMusicWebos from '../winxp/assets/icons/folder-music.png';
import folderRecentWebos from '../winxp/assets/icons/folder-recent.png';
import trayExpandWebos from '../winxp/assets/widgets/tray-expand.png';
import ieIconWebos from '../winxp/assets/icons/ie.png';
import mailIconWebos from '../winxp/assets/icons/outlook.png';
import mediaPlayerIconWebos from '../winxp/assets/icons/mediaplayer.png';
import winampIconWebos from '../winxp/assets/icons/winamp.png';
import gamesIconWebos from '../winxp/assets/icons/pinball.png';
import projectsIconWebos from '../winxp/assets/icons/folder_program.png';
import userAvatarWebos from '../winxp/assets/user.gif';
import windowsLogoWebos from '../winxp/assets/windows.png';
import bootWallpaperWebos from '../../content/pictures/wallpapers/windows/winxp-bliss.jpg';
import minesweeperIconWebos from '../../apps/minesweeper/assets/icon.png';
import calculatorIconWebos from '../winxp/assets/icons/calc.png';
import paintIconWebos from '../winxp/assets/icons/paint.png';
import controlPanelIconWebos from '../winxp/assets/icons/hardware.png';
import notepadIconWebos from '../winxp/assets/icons/Notepad.png';
import picturesIconWebos from '../winxp/assets/icons/Windows Picture and Fax Viewer.png';
import richTextIconWebos from '../winxp/assets/icons/filetypes/rich-text.png';
import bootLogoWebos from './assets/boot/boot-windows-logo.png';
import bootProgressWebos from '../winxp/assets/boot/boot-progress.png';
import doomIconWebos from '../../apps/doom/assets/doom-icon-sm.webp';
import gamesFolderIconWebos from '../winxp/assets/icons/filetypes/folder-favorites.png';
import appearanceIconWebos from '../winxp/assets/icons/appearance.png';
import networkIconWebos from '../winxp/assets/icons/internet.png';
import addRemoveIconWebos from '../winxp/assets/icons/folder_program.png';
import soundIconWebos from '../winxp/assets/icons/sound.png';
import maintenanceIconWebos from '../winxp/assets/icons/green_shield.png';
import hardwareIconWebos from '../winxp/assets/icons/printers-and-faxes.png';
import usersIconWebos from '../winxp/assets/icons/users.png';
import regionalIconWebos from '../winxp/assets/icons/earth.png';
import accessibilityIconWebos from '../winxp/assets/icons/help.png';
import volumeIconWebos from '../winxp/assets/icons/Volume.png';
import muteIconWebos from '../winxp/assets/icons/Mute.png';
import fullscreenIconWebos from '../winxp/assets/icons/full-screen-icon-sm.webp';
import notificationIconWebos from '../winxp/assets/icons/Information.png';
import calendarIconWebos from '../winxp/assets/icons/Date and Time.png';
import terminalIconWebos from '../winxp/assets/icons/cmd.png';
import rssNewsIcon from '../../assets/icons/rss-icon.svg';
import currencyDollarIcon from '../../assets/icons/currency-dollar-icon.svg';
import runIconWebos from '../winxp/assets/icons/run.png';
import helpIconWebos from '../winxp/assets/icons/help.png';
import performanceMonitorIconWebos from '../winxp/assets/icons/Performance Monitor.png';
import searchIconWebos from '../winxp/assets/icons/search.png';
import printersIconWebos from '../winxp/assets/icons/printers-and-faxes.png';
import { WIN7_ASSETS } from '../win7/assets';
import { WIN7_ICON_ASSETS } from '../win7/iconAssets';
import { WIN2000_ICON_ASSETS } from '../win2000/iconAssets';
import win98Startup from '../win98/assets/audio/windows-98-startup.mp3';
import win98StartIcon from '../win98/assets/icons/start98.png';
import { WIN98_ICON_ASSETS } from '../win98/iconAssets';

type StartMenuIconSet = {
  internetExplorer?: string;
  outlook?: string;
  windowsMediaPlayer?: string;
  games?: string;
  projects?: string;
  minesweeper?: string;
  calculator?: string;
  paint?: string;
};

type PlaceIconSet = {
  myDocuments?: string;
  myPictures?: string;
  myMusic?: string;
  myComputer?: string;
  recentDocuments?: string;
  controlPanel?: string;
  programAccess?: string;
  connectTo?: string;
  printers?: string;
  help?: string;
  search?: string;
  run?: string;
};

export type ThemeAssetId = 'webos' | 'win-xp' | 'win-98' | 'win7' | 'win2000';

export interface ThemeAssets {
  folderIcon?: string;
  computerIcon?: string;
  recycleIcon?: string;
  recycleFullIcon?: string;
  startButtonIcon?: string;
  startButtonHoverIcon?: string;
  trayExpandIcon?: string;
  wallpaper?: string;
  userAvatar?: string;
  internetExplorerIcon?: string;
  mailIcon?: string;
  mediaPlayerIcon?: string;
  winampIcon?: string;
  gamesIcon?: string;
  doomIcon?: string;
  gamesFolderIcon?: string;
  projectsIcon?: string;
  minesweeperIcon?: string;
  calculatorIcon?: string;
  paintIcon?: string;
  controlPanelIcon?: string;
  notepadIcon?: string;
  picturesIcon?: string;
  helpIcon?: string;
  performanceMonitorIcon?: string;
  richTextIcon?: string;
  bootLogo?: string;
  bootProgress?: string;
  startupSound?: string;
  shutdownSound?: string;
  logoffSound?: string;
  volumeIcon?: string;
  muteIcon?: string;
  fullscreenIcon?: string;
  notificationIcon?: string;
  /** Calendar app icon (Date and Time.png) */
  calendarIcon?: string;
  /** Terminal app icon (cmd.png) */
  terminalIcon?: string;
  /** News app icon (RSS) */
  newsIcon?: string;
  /** Currency / Market Rates app icon ($) */
  currencyIcon?: string;
  startMenuIcons: StartMenuIconSet;
  placesIcons: PlaceIconSet;
  uiSounds?: {
    menuOpen?: string;
    menuClose?: string;
    menuHover?: string;
    launchApp?: string;
    minimize?: string;
    restore?: string;
    error?: string;
    closeWindow?: string;
  };
  controlPanelIcons?: Record<string, string>;
}

const sharedWebosAssets: ThemeAssets = {
  folderIcon: folderPlainWebos,
  computerIcon: myComputerWebos,
  recycleIcon: recycleBinWebos,
  startButtonIcon: windowsLogoWebos,
  trayExpandIcon: trayExpandWebos,
  wallpaper: bootWallpaperWebos,
  userAvatar: userAvatarWebos,
  internetExplorerIcon: ieIconWebos,
  mailIcon: mailIconWebos,
  mediaPlayerIcon: mediaPlayerIconWebos,
  winampIcon: winampIconWebos,
  gamesIcon: gamesIconWebos,
  gamesFolderIcon: gamesFolderIconWebos,
  projectsIcon: projectsIconWebos,
  minesweeperIcon: minesweeperIconWebos,
  calculatorIcon: calculatorIconWebos,
  paintIcon: paintIconWebos,
  controlPanelIcon: controlPanelIconWebos,
  doomIcon: doomIconWebos,
  notepadIcon: notepadIconWebos,
  picturesIcon: picturesIconWebos,
  helpIcon: helpIconWebos,
  performanceMonitorIcon: performanceMonitorIconWebos,
  richTextIcon: richTextIconWebos,
  bootLogo: bootLogoWebos,
  bootProgress: bootProgressWebos,
  calendarIcon: calendarIconWebos,
  terminalIcon: terminalIconWebos,
  newsIcon: rssNewsIcon,
  currencyIcon: currencyDollarIcon,
  volumeIcon: volumeIconWebos,
  muteIcon: muteIconWebos,
  fullscreenIcon: fullscreenIconWebos,
  notificationIcon: notificationIconWebos,
  startupSound: '/sounds/system/xp-startup.mp3',
  shutdownSound: '/sounds/system/xp-shutdown.mp3',
  logoffSound: '/sounds/system/xp-logoff.mp3',
  uiSounds: {
    menuOpen: '/sounds/ui/xp-menu-open.mp3',
    menuClose: '/sounds/ui/xp-menu-close.mp3',
    menuHover: '/sounds/ui/xp-menu-hover.mp3',
    launchApp: '/sounds/ui/xp-launch.mp3',
    minimize: '/sounds/ui/xp-minimize.mp3',
    restore: '/sounds/ui/xp-restore.mp3',
    error: '/sounds/ui/xp-error.mp3',
  },
  startMenuIcons: {
    internetExplorer: ieIconWebos,
    outlook: mailIconWebos,
    windowsMediaPlayer: mediaPlayerIconWebos,
    games: gamesIconWebos,
    projects: projectsIconWebos,
    minesweeper: minesweeperIconWebos,
    calculator: calculatorIconWebos,
    paint: paintIconWebos,
  },
  placesIcons: {
    myDocuments: folderDocumentsWebos,
    myPictures: folderPicturesWebos,
    myMusic: folderMusicWebos,
    myComputer: myComputerWebos,
    recentDocuments: folderRecentWebos,
    controlPanel: controlPanelIconWebos,
    programAccess: folderPlainWebos,
    connectTo: networkIconWebos,
    printers: printersIconWebos,
    help: helpIconWebos,
    search: searchIconWebos,
    run: runIconWebos,
  },
  controlPanelIcons: {
    appearance: appearanceIconWebos,
    network: networkIconWebos,
    programs: addRemoveIconWebos,
    sounds: soundIconWebos,
    maintenance: maintenanceIconWebos,
    hardware: hardwareIconWebos,
    users: usersIconWebos,
    regional: regionalIconWebos,
    accessibility: accessibilityIconWebos,
  },
};

const xpThemeAssets: ThemeAssets = {
  ...sharedWebosAssets,
  startMenuIcons: { ...sharedWebosAssets.startMenuIcons },
  placesIcons: { ...sharedWebosAssets.placesIcons },
};

const win7ThemeAssets: ThemeAssets = {
  ...sharedWebosAssets,
  ...WIN7_ICON_ASSETS,
  startupSound: WIN7_ASSETS.startupSound,
  startMenuIcons: {
    ...sharedWebosAssets.startMenuIcons,
    ...WIN7_ICON_ASSETS.startMenuIcons,
  },
  placesIcons: {
    ...sharedWebosAssets.placesIcons,
    ...WIN7_ICON_ASSETS.placesIcons,
  },
};

export const THEME_ASSETS: Record<ThemeAssetId, ThemeAssets> = {
  webos: sharedWebosAssets,
  'win-xp': xpThemeAssets,
  win7: win7ThemeAssets,
  'win-98': {
    ...sharedWebosAssets,
    ...WIN98_ICON_ASSETS,
    startButtonIcon: win98StartIcon,
    winampIcon: WIN98_ICON_ASSETS.mediaPlayerIcon,
    richTextIcon: WIN98_ICON_ASSETS.notepadIcon,
    gamesIcon: WIN98_ICON_ASSETS.minesweeperIcon,
    gamesFolderIcon: WIN98_ICON_ASSETS.folderIcon,
    startMenuIcons: {
      internetExplorer: WIN98_ICON_ASSETS.internetExplorerIcon,
      outlook: WIN98_ICON_ASSETS.mailIcon,
      windowsMediaPlayer: WIN98_ICON_ASSETS.mediaPlayerIcon,
      games: WIN98_ICON_ASSETS.minesweeperIcon,
      projects: WIN98_ICON_ASSETS.folderIcon,
      minesweeper: WIN98_ICON_ASSETS.minesweeperIcon,
      calculator: WIN98_ICON_ASSETS.calculatorIcon,
      paint: WIN98_ICON_ASSETS.paintIcon,
    },
    placesIcons: {
      myDocuments: WIN98_ICON_ASSETS.myDocumentsIcon, 
      myPictures: WIN98_ICON_ASSETS.picturesIcon,
      myMusic: WIN98_ICON_ASSETS.mediaPlayerIcon,
      myComputer: WIN98_ICON_ASSETS.computerIcon,
      recentDocuments: WIN98_ICON_ASSETS.folderIcon,
      controlPanel: WIN98_ICON_ASSETS.controlPanelIcon,
      programAccess: WIN98_ICON_ASSETS.folderIcon,
      connectTo: WIN98_ICON_ASSETS.networkIcon,
      help: WIN98_ICON_ASSETS.helpIcon,
      search: WIN98_ICON_ASSETS.searchIcon,
      run: WIN98_ICON_ASSETS.terminalIcon,
    },
    controlPanelIcons: {
      appearance: WIN98_ICON_ASSETS.computerIcon,
      network: WIN98_ICON_ASSETS.networkIcon,
      programs: WIN98_ICON_ASSETS.folderIcon,
      sounds: WIN98_ICON_ASSETS.soundIcon,
      hardware: WIN98_ICON_ASSETS.computerIcon,
      accessibility: WIN98_ICON_ASSETS.helpIcon,
    },
    startupSound: win98Startup,
    shutdownSound: '/sounds/system/win98-shutdown.mp3',
    logoffSound: '/sounds/system/win98-logoff.mp3',
    uiSounds: {
      menuOpen: '/sounds/ui/win98-menu-open.mp3',
      menuClose: '/sounds/ui/win98-menu-close.mp3',
      launchApp: '/sounds/ui/win98-launch.mp3',
      minimize: '/sounds/ui/win98-minimize.mp3',
      restore: '/sounds/ui/win98-restore.mp3',
      error: '/sounds/ui/win98-error.mp3',
    },
  },
  win2000: {
    ...WIN2000_ICON_ASSETS,
    startupSound: '/sounds/system/win2000-startup.mp3',
    shutdownSound: '/sounds/system/win2000-shutdown.mp3',
    logoffSound: '/sounds/system/win98-logoff.mp3',
    uiSounds: {
      menuOpen: '/sounds/ui/win98-menu-open.mp3',
      menuClose: '/sounds/ui/win98-menu-close.mp3',
      launchApp: '/sounds/ui/win98-launch.mp3',
      minimize: '/sounds/ui/win98-minimize.mp3',
      restore: '/sounds/ui/win98-restore.mp3',
      error: '/sounds/ui/win98-error.mp3',
    },
    startMenuIcons: {},
    placesIcons: {},
  },
};