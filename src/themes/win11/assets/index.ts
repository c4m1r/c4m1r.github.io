import folder from './icons/folder.png';
import folderLight from './icons/folder-light.png';
import computer from './icons/computer.png';
import drive from './icons/drive.png';
import floppy from './icons/floppy.png';
import cd from './icons/cd.png';
import recycleEmpty from './icons/recycle-empty.png';
import recycleFull from './icons/recycle-full.png';
import printers from './icons/printers.png';
import network from './icons/network.png';
import help from './icons/help.png';
import favorites from './icons/favorites.png';
import pictures from './icons/pictures.png';
import music from './icons/music.png';
import user from './icons/user.png';
import fonts from './icons/fonts.png';

/**
 * Windows 11 system icons, taken from the Windows 11 shell32.dll / imageres.dll resources
 * (source set: eat/ reference, extracted into 32 px PNG). Used by the Windows 11 skin only.
 */
export const WIN11_ICON_ASSETS = {
  folderIcon: folder,
  computerIcon: computer,
  driveIcon: drive,
  recycleIcon: recycleEmpty,
  recycleFullIcon: recycleFull,
  placesIcons: {
    myComputer: computer,
    myDocuments: folderLight,
    myPictures: pictures,
    myMusic: music,
    controlPanel: help,
    help,
    printers,
    network,
    favorites,
    user,
    fonts,
    floppy,
    cd,
  },
} as const;
