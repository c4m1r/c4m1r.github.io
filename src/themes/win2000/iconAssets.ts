/**
 * Windows 2000 shell icon roles.
 *
 * The source icon archive includes explicitly named _2k variants. Prefer
 * those over Windows 98/XP lookalikes; keep this registry partial until the
 * remaining roles are identified from native assets.
 */
import computerIcon from '../win98/icons/devices/computer-explorer-2k/48x48-4.png';
import myDocumentsIcon from '../win98/icons/documents/directory-open-file-mydocs-2k/48x48-4.png';
import recycleIcon from '../win98/icons/system/recycle-bin-empty-2k/48x48-4.png';
import recycleFullIcon from '../win98/icons/system/recycle-bin-full-2k/48x48-4.png';

export const WIN2000_ICON_ASSETS = {
  computerIcon,
  recycleIcon,
  recycleFullIcon,
  placesIcons: {
    myComputer: computerIcon,
    myDocuments: myDocumentsIcon,
  },
} as const;
