import type { ThemeId } from '../../contexts/appContextTypes';

/**
 * Canonical Explorer view modes and the per-OS Views menu.
 * Windows 98 and 2000 offer Large Icons, Small Icons, List and Details.
 * Windows 10 and 11 (and the Vista and 8 drafts that share the classic shell) use the same four
 * entries in the Views menu. XP and the non-Windows skins keep their own cycle.
 */

export type ExplorerViewMode = 'thumbnails' | 'tiles' | 'icons' | 'small' | 'list' | 'details';

/** Modes that appear as radio entries in the Views menu. */
export type ExplorerViewMenuMode = 'icons' | 'small' | 'tiles' | 'list' | 'details';

export interface ExplorerViewMenuEntry {
  mode: ExplorerViewMenuMode;
  label: string;
}

/** Themes whose Explorer opens the Views menu instead of cycling through modes. */
const VIEW_MENU_THEMES: ReadonlySet<ThemeId> = new Set<ThemeId>([
  'win-98',
  'win2000',
  'vista',
  'win8',
  'win10',
  'win11',
]);

export function usesViewsMenu(theme: ThemeId): boolean {
  return VIEW_MENU_THEMES.has(theme);
}

/** Vista and later add Tiles to the Views menu; Windows 98 and 2000 do not have it. */
const TILES_THEMES: ReadonlySet<ThemeId> = new Set<ThemeId>(['vista', 'win8', 'win10', 'win11']);

export function viewMenuEntries(isRu: boolean, theme: ThemeId): ExplorerViewMenuEntry[] {
  const entries: ExplorerViewMenuEntry[] = [
    { mode: 'icons', label: isRu ? 'Крупные значки' : 'Large Icons' },
    { mode: 'small', label: isRu ? 'Мелкие значки' : 'Small Icons' },
    { mode: 'list', label: isRu ? 'Список' : 'List' },
    { mode: 'details', label: isRu ? 'Таблица' : 'Details' },
  ];
  if (TILES_THEMES.has(theme)) {
    entries.splice(2, 0, { mode: 'tiles', label: isRu ? 'Плитка' : 'Tiles' });
  }
  return entries;
}

/** Views cycled by the single Views button on themes without a menu (XP and the rest). */
export const CYCLED_VIEW_MODES: Array<'thumbnails' | 'icons' | 'details'> = ['thumbnails', 'icons', 'details'];

export function nextCycledViewMode(current: ExplorerViewMode): 'thumbnails' | 'icons' | 'details' {
  const currentMode = (current === 'thumbnails' || current === 'icons' || current === 'details') ? current : 'icons';
  const nextIndex = (CYCLED_VIEW_MODES.indexOf(currentMode) + 1) % CYCLED_VIEW_MODES.length;
  return CYCLED_VIEW_MODES[nextIndex];
}
