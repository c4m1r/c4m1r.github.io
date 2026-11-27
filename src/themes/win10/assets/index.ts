import folder from './icons/folder.png';
import folderLight from './icons/folder-light.png';
import computer from './icons/computer.png';
import drive from './icons/drive.png';
import floppy from './icons/floppy.png';
import recycleEmpty from './icons/recycle-empty.png';
import recycleFull from './icons/recycle-full.png';
import network from './icons/network.png';
import help from './icons/help.png';
import user from './icons/user.png';

/**
 * Windows 10 system icons, taken from the Windows 10 shell32.dll / imageres.dll resources
 * (source set: eat/ reference, indexes checked on a contact sheet, exported to 32 px PNG).
 * Used by the Windows 10 skin only; anything not listed falls back to the Windows 7 base.
 */
export const WIN10_ICON_ASSETS = {
  folderIcon: folder,
  computerIcon: computer,
  driveIcon: drive,
  recycleIcon: recycleEmpty,
  recycleFullIcon: recycleFull,
  placesIcons: {
    myComputer: computer,
    myDocuments: folderLight,
    network,
    controlPanel: help,
    help,
    user,
    floppy,
    drive,
  },
} as const;
