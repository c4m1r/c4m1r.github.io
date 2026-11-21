/**
 * Windows 7 native icon roles.
 *
 * Named assets come from the hand-named bank (computer, folder, IE, mail,
 * volume). The remaining roles come from the standardized category/name layout
 * in src/themes/win7/icons/ (see scripts/organize-win7-icons.py). Each role was
 * checked visually on a labelled contact sheet before being assigned here.
 * Roles not listed keep the shared fallback; do not assign numeric filenames.
 */
import { WIN7_ASSETS } from './assets';
import calculatorIcon from './icons/apps/calculator.png';
import paintIcon from './icons/media/paint-image.png';
import notepadIcon from './icons/apps/notepad.png';
import mediaPlayerIcon from './icons/media/video-player-doc.png';
import terminalIcon from './icons/apps/terminal-black.png';
import minesweeperIcon from './icons/apps/mine.png';
import calendarIcon from './icons/apps/calendar.png';
// Generic Windows 7 application icon (window with title bar): no native alarm icon in the set.
import alarmIcon from './icons/apps/window-run.png';
import solitaireIcon from './icons/apps/solitaire.png';
import helpIcon from './icons/system/help-circle.png';
import controlPanelIcon from './icons/system/gears-window.png';
import recycleIcon from './icons/system/recycle-bin-empty.png';
import recycleFullIcon from './icons/system/recycle-bin-full.png';
import picturesIcon from './icons/media/image-picture.png';
import performanceMonitorIcon from './icons/system/monitor-pulse.png';
import searchIcon from './icons/system/search.png';
import gamesIcon from './icons/apps/cards-spade.png';
import folderPlainIcon from './icons/folders/folder-plain.png';
import folderDocumentsIcon from './icons/folders/folder-documents.png';
import folderPicturesIcon from './icons/folders/folder-pictures.png';
import printersIcon from './icons/devices/printer-2.png';
// Windows 7 drives: system drive (Windows logo), floppy and CD, from the standardized bank.
import driveIcon from './icons/devices/drive-small.png';
import floppyDriveIcon from './icons/devices/floppy-drive.png';
import cdDriveIcon from './icons/devices/cd-drive.png';

export const WIN7_ICON_ASSETS = {
  computerIcon: WIN7_ASSETS.computerIcon,
  driveIcon,
  floppyDriveIcon,
  cdDriveIcon,
  folderIcon: folderPlainIcon,
  internetExplorerIcon: WIN7_ASSETS.internetExplorerIcon,
  mailIcon: WIN7_ASSETS.mailIcon,
  volumeIcon: WIN7_ASSETS.volumeIcon,
  startButtonIcon: WIN7_ASSETS.startOrb,
  startButtonHoverIcon: WIN7_ASSETS.startOrbHover,
  wallpaper: WIN7_ASSETS.desktopWallpaper,
  userAvatar: WIN7_ASSETS.userAvatar,
  calculatorIcon,
  paintIcon,
  notepadIcon,
  mediaPlayerIcon,
  terminalIcon,
  minesweeperIcon,
  calendarIcon,
  alarmIcon,
  solitaireIcon,
  helpIcon,
  controlPanelIcon,
  recycleIcon,
  recycleFullIcon,
  picturesIcon,
  performanceMonitorIcon,
  searchIcon,
  gamesIcon,
  startMenuIcons: {
    internetExplorer: WIN7_ASSETS.internetExplorerIcon,
    outlook: WIN7_ASSETS.mailIcon,
    windowsMediaPlayer: mediaPlayerIcon,
    calculator: calculatorIcon,
    paint: paintIcon,
    minesweeper: minesweeperIcon,
    games: gamesIcon,
  },
  placesIcons: {
    myComputer: WIN7_ASSETS.computerIcon,
    myDocuments: folderDocumentsIcon,
    myPictures: folderPicturesIcon,
    controlPanel: controlPanelIcon,
    help: helpIcon,
    search: searchIcon,
    printers: printersIcon,
  },
} as const;
