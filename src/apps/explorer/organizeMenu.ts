import type { ClassicEditKey } from '../../i18n/classicEditStrings';

/**
 * "Organize" drop-down of the Windows 7 and Windows Vista Explorer, in command-bar order.
 * 'separator' marks a rule between groups. Labels come from classicEditStrings (nine languages).
 */
export const ORGANIZE_MENU: Array<ClassicEditKey | 'separator'> = [
  'cut', 'copy', 'paste', 'separator',
  'undo', 'redo', 'separator',
  'selectAll', 'separator',
  'delete', 'rename', 'separator',
  'layout', 'folderOptions', 'separator',
  'properties', 'separator',
  'close',
];
