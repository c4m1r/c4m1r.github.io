/**
 * Windows 7 native icon roles.
 *
 * Only named assets with clear semantic identity are mapped here. The large
 * numbered image collection is intentionally excluded until a contact sheet
 * identifies each icon; do not assign numeric filenames by guesswork.
 */
import { WIN7_ASSETS } from './assets';

export const WIN7_ICON_ASSETS = {
  computerIcon: WIN7_ASSETS.computerIcon,
  folderIcon: WIN7_ASSETS.folderIcon,
  internetExplorerIcon: WIN7_ASSETS.internetExplorerIcon,
  mailIcon: WIN7_ASSETS.mailIcon,
  volumeIcon: WIN7_ASSETS.volumeIcon,
  startButtonIcon: WIN7_ASSETS.startOrb,
  startButtonHoverIcon: WIN7_ASSETS.startOrbHover,
  wallpaper: WIN7_ASSETS.desktopWallpaper,
  userAvatar: WIN7_ASSETS.userAvatar,
  startMenuIcons: {
    internetExplorer: WIN7_ASSETS.internetExplorerIcon,
    outlook: WIN7_ASSETS.mailIcon,
  },
  placesIcons: {
    myComputer: WIN7_ASSETS.computerIcon,
    myDocuments: WIN7_ASSETS.folderIcon,
  },
} as const;
