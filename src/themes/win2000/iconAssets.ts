/**
 * Windows 2000 shell icon roles.
 *
 * The source icon archive includes explicitly named _2k variants. Prefer
 * those over Windows 98/XP lookalikes; keep this registry partial until the
 * remaining roles are identified from native assets.
 */
import computerIcon from '../win98/assets/icons/computer_explorer_2k-4.png';
import myDocumentsIcon from '../win98/assets/icons/directory_open_file_mydocs_2k-4.png';
import recycleIcon from '../win98/assets/icons/recycle_bin_empty_2k-4.png';
import recycleFullIcon from '../win98/assets/icons/recycle_bin_full_2k-4.png';

export const WIN2000_ICON_ASSETS = {
  computerIcon,
  recycleIcon,
  recycleFullIcon,
  placesIcons: {
    myComputer: computerIcon,
    myDocuments: myDocumentsIcon,
  },
} as const;
