/**
 * Native Windows 98 icon roles.
 *
 * The source bank contains classic 16/32px-era shell artwork. Keep this map
 * separate from XP: a missing role should remain visibly missing during audit
 * rather than silently inheriting a later Windows generation's glossy icon.
 */
import computerIcon from './icons/devices/computer-2-cool/48x48-3.png';
import driveIcon from './icons/devices/hard-disk-drive/32x32-0.png';
import folderIcon from './icons/folders/directory-closed/48x48-4.png';
import internetExplorerIcon from './icons/network/msie1/48x48-2.png';
import mailIcon from './icons/network/mailbox-world/48x48-2.png';
import mediaPlayerIcon from './icons/media/media-player/32x32-0.png';
import calculatorIcon from './icons/apps/calculator/32x32-0.png';
import calendarIcon from './icons/apps/calendar/48x48-0.png';
// Generic Windows 98 application icon: no native alarm clock exists in the set.
import alarmIcon from './icons/apps/installer-generic-old/32x32-0.png';
import solitaireIcon from './icons/apps/game-solitaire/32x32-0.png';
import freecellIcon from './icons/apps/game-freecell/32x32-0.png';
import heartsIcon from './icons/apps/game-hearts/32x32-0.png';
import picturesIcon from './icons/media/kodak-imaging/32x32-0.png';
import controlPanelIcon from './icons/folders/directory-control-panel/48x48-0.png';
import helpIcon from './icons/devices/help-book-computer/48x48-4.png';
import terminalIcon from './icons/apps/ms-dos/32x32-0.png';
import minesweeperIcon from './icons/apps/game-mine-1/32x32-0.png';
import notepadIcon from './icons/documents/document/32x32-0.png';
import networkIcon from './icons/network/directory-network-conn/48x48-5.png';
import volumeIcon from './icons/media/loudspeaker-rays/32x32-0.png';
import soundIcon from './icons/media/computer-sound/32x32-0.png';
import recycleIcon from './icons/system/recycle-bin-empty/48x48-4.png';
import recycleFullIcon from './icons/system/recycle-bin-full/48x48-2.png';
import myDocumentsIcon from './icons/documents/directory-open-file-mydocs/32x32-0.png';
import searchIcon from './icons/devices/search-computer/32x32-0.png';
import paintIcon from './icons/apps/paint-old/32x32-0.png';

export const WIN98_ICON_ASSETS = {
  computerIcon,
  driveIcon,
  folderIcon,
  recycleIcon,
  recycleFullIcon,
  myDocumentsIcon,
  searchIcon,
  internetExplorerIcon,
  mailIcon,
  mediaPlayerIcon,
  calculatorIcon,
  calendarIcon,
  alarmIcon,
  solitaireIcon,
  freecellIcon,
  heartsIcon,
  picturesIcon,
  controlPanelIcon,
  helpIcon,
  terminalIcon,
  minesweeperIcon,
  notepadIcon,
  networkIcon,
  volumeIcon,
  soundIcon,
  paintIcon,
} as const;
