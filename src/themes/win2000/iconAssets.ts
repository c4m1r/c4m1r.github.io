/**
 * Windows 2000 shell icon roles.
 *
 * Roles below come from the native Windows 2000 ICO set in eat/windows2000-main
 * (sizes kept exactly as authored, no upscaling). Roles without a confident
 * native match stay unset rather than inheriting Windows 98/XP artwork.
 */
import computerIcon from '../win98/icons/devices/computer-explorer-2k/48x48-4.png';
import myDocumentsIcon from '../win98/icons/documents/directory-open-file-mydocs-2k/48x48-4.png';
import recycleIcon from '../win98/icons/system/recycle-bin-empty-2k/48x48-4.png';
import recycleFullIcon from '../win98/icons/system/recycle-bin-full-2k/48x48-4.png';
import folderIcon from './icons/folders/folder-plain/48x48.png';
import networkIcon from './icons/network/network-computers/48x48.png';
import internetExplorerIcon from './icons/apps/internet-explorer/48x48.png';
import printersIcon from './icons/devices/printer/48x48.png';
import controlPanelIcon from './icons/system/control-panel/48x48.png';
import helpIcon from './icons/system/help-book/48x48.png';
import searchIcon from './icons/folders/folder-search/48x48.png';
import fontsIcon from './icons/system/fonts/48x48.png';
import securityIcon from './icons/security/key/48x48.png';

export const WIN2000_ICON_ASSETS = {
  computerIcon,
  recycleIcon,
  recycleFullIcon,
  folderIcon,
  networkIcon,
  internetExplorerIcon,
  printersIcon,
  controlPanelIcon,
  helpIcon,
  searchIcon,
  fontsIcon,
  securityIcon,
  placesIcons: {
    myComputer: computerIcon,
    myDocuments: myDocumentsIcon,
    network: networkIcon,
    controlPanel: controlPanelIcon,
    help: helpIcon,
    search: searchIcon,
    printers: printersIcon,
  },
} as const;
