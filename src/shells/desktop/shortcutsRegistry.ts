import { isFeatureEnabled } from '../../config/features';

export const desktopShortcuts: string[] = [
  'internet-explorer',
  'outlook',
  'windows-media-player',
  'projects-grid',
  'calculator',
  'paint',
  'control-panel',
  'pictures',
  'blog',
  ...(isFeatureEnabled('news') ? ['news'] : []),
  'wiki',
  'notepad',
  'calendar',
  'terminal',
  'task-manager',
  'about',
  'minesweeper',
];
