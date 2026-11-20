/**
 * Native Windows 98 icon roles.
 *
 * The source bank contains classic 16/32px-era shell artwork. Keep this map
 * separate from XP: a missing role should remain visibly missing during audit
 * rather than silently inheriting a later Windows generation's glossy icon.
 */
import computerIcon from './assets/icons/computer_2_cool-3.png';
import folderIcon from './assets/icons/directory_closed-4.png';
import internetExplorerIcon from './assets/icons/msie1-2.png';
import mailIcon from './assets/icons/mailbox_world-2.png';
import mediaPlayerIcon from './assets/icons/media_player-0.png';
import calculatorIcon from './assets/icons/calculator-0.png';
import calendarIcon from './assets/icons/calendar-0.png';
import picturesIcon from './assets/icons/kodak_imaging-0.png';
import controlPanelIcon from './assets/icons/directory_control_panel-0.png';
import helpIcon from './assets/icons/help_book_computer-4.png';
import terminalIcon from './assets/icons/ms_dos-0.png';
import minesweeperIcon from './assets/icons/game_mine_1-0.png';
import notepadIcon from './assets/icons/document-0.png';
import networkIcon from './assets/icons/directory_network_conn-5.png';
import volumeIcon from './assets/icons/loudspeaker_rays-0.png';
import soundIcon from './assets/icons/computer_sound-0.png';
import recycleIcon from './assets/icons/recycle_bin_empty-4.png';
import recycleFullIcon from './assets/icons/recycle_bin_full-2.png';
import myDocumentsIcon from './assets/icons/directory_open_file_mydocs-0.png';
import searchIcon from './assets/icons/search_computer-0.png';
import paintIcon from './assets/icons/paint_old-0.png';

export const WIN98_ICON_ASSETS = {
  computerIcon,
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
