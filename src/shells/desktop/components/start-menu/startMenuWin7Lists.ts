import { appRegistry } from '../../appRegistry';
import { THEME_ASSETS } from '../../../../themes/webos/themeAssets';
import type { Language } from '../../../../i18n/translations';
import { vistaText } from '../../../../i18n/vistaStrings';

/**
 * The fixed lists of the Windows 7 Start menu: the default program list, All Programs, and the
 * places column. The component renders them and keeps the search, flyouts and launching.
 */

export type Win7MenuEntry = {
  id: string;
  label: string;
  /** Second line under the label (the Vista pinned entries: Internet / Internet Explorer). */
  subtitle?: string;
  submenu?: Win7MenuEntry[];
  appId?: string;
  path?: string;
  icon?: string;
  disabled?: boolean;
};

const DOCUMENTS_PATH = 'C:\\Users\\C4m1r\\My Documents';
const PICTURES_PATH = 'C:\\Users\\C4m1r\\My Documents\\My Pictures';
const MUSIC_PATH = 'C:\\Users\\C4m1r\\My Documents\\My Music';

export function buildWin7StartMenuLists({ isRu, language, vista = false, account = 'User' }: { isRu: boolean; language: Language; vista?: boolean; account?: string }) {
  const assets = THEME_ASSETS.win7;

  const programs: Win7MenuEntry[] = [
    {
      id: 'internet-explorer',
      label: appRegistry['internet-explorer']?.title[language] ?? 'Internet Explorer',
      appId: 'internet-explorer',
      icon: assets.internetExplorerIcon,
    },
    {
      id: 'outlook',
      label: appRegistry.outlook?.title[language] ?? 'Outlook Express',
      appId: 'outlook',
      icon: assets.mailIcon,
    },
    {
      id: 'windows-media-player',
      label: appRegistry['windows-media-player']?.title[language] ?? 'Windows Media Player',
      appId: 'windows-media-player',
      icon: assets.mediaPlayerIcon,
    },
    {
      id: 'winamp',
      label: 'Winamp',
      appId: 'winamp',
      icon: assets.winampIcon,
    },
    {
      id: 'projects-grid',
      label: appRegistry['projects-grid']?.title[language] ?? (isRu ? 'Мои проекты' : 'My Projects'),
      appId: 'projects-grid',
      icon: assets.projectsIcon,
    },
    {
      id: 'paint',
      label: appRegistry.paint?.title[language] ?? 'Paint',
      appId: 'paint',
      icon: assets.paintIcon,
    },
    {
      id: 'calculator',
      label: appRegistry.calculator?.title[language] ?? (isRu ? 'Калькулятор' : 'Calculator'),
      appId: 'calculator',
      icon: assets.calculatorIcon,
    },
    {
      id: 'notepad',
      label: appRegistry.notepad?.title[language] ?? (isRu ? 'Блокнот' : 'Notepad'),
      appId: 'notepad',
      icon: assets.notepadIcon,
    },
    {
      id: 'news',
      label: appRegistry.news?.title[language] ?? (isRu ? 'Лента новостей RSS' : 'News RSS Feed'),
      appId: 'news',
      icon: assets.newsIcon,
    },
    {
      id: 'currency',
      label: appRegistry.currency?.title[language] ?? (isRu ? 'Курсы валют' : 'Market Rates'),
      appId: 'currency',
      icon: assets.currencyIcon,
    },
  ];

  const allPrograms: Win7MenuEntry[] = [
    ...programs,
    { id: 'pictures-viewer', label: isRu ? 'Просмотр изображений' : 'Picture Viewer', appId: 'pictures', icon: assets.folderIcon },
    { id: 'calendar', label: isRu ? 'Календарь' : 'Calendar', appId: 'calendar', icon: assets.notepadIcon },
    { id: 'alarm', label: isRu ? 'Будильник' : 'Alarm', appId: 'alarm', icon: assets.alarmIcon ?? assets.notepadIcon },
    { id: 'control-panel', label: isRu ? 'Панель управления' : 'Control Panel', appId: 'control-panel', icon: assets.controlPanelIcon },
    { id: 'task-manager', label: isRu ? 'Диспетчер задач' : 'Task Manager', appId: 'task-manager', icon: assets.controlPanelIcon },
    { id: 'wiki', label: 'Wiki', appId: 'wiki', icon: assets.projectsIcon },
    { id: 'help', label: isRu ? 'Справка и поддержка' : 'Help and Support', appId: 'help', icon: assets.folderIcon },
    { id: 'terminal', label: isRu ? 'Терминал' : 'Terminal', appId: 'terminal', icon: assets.terminalIcon },
    { id: 'loops', label: 'Loops', appId: 'loops', icon: assets.mediaPlayerIcon },
    { id: 'minesweeper', label: isRu ? 'Сапёр' : 'Minesweeper', appId: 'minesweeper', icon: assets.minesweeperIcon },
    { id: 'snake', label: isRu ? 'Змейка' : 'Snake', appId: 'snake', icon: assets.gamesIcon },
    { id: 'memory', label: isRu ? 'Память' : 'Memory', appId: 'memory', icon: assets.gamesIcon },
    { id: 'doom1', label: 'DOOM', appId: 'doom1', icon: assets.doomIcon },
    { id: 'doom2', label: 'DOOM II', appId: 'doom2', icon: assets.doomIcon },
  ];

  const places: Win7MenuEntry[] = [
    {
      id: 'documents',
      label: isRu ? 'Документы' : 'Documents',
      path: DOCUMENTS_PATH,
      icon: assets.placesIcons.myDocuments ?? assets.folderIcon,
    },
    {
      id: 'pictures',
      label: isRu ? 'Изображения' : 'Pictures',
      path: PICTURES_PATH,
      icon: assets.placesIcons.myPictures ?? assets.folderIcon,
    },
    {
      id: 'music',
      label: isRu ? 'Музыка' : 'Music',
      path: MUSIC_PATH,
      icon: assets.placesIcons.myMusic ?? assets.folderIcon,
    },
    {
      id: 'games',
      label: isRu ? 'Игры' : 'Games',
      path: 'C:\\Program Files',
      icon: assets.gamesFolderIcon ?? assets.folderIcon,
    },
    {
      id: 'computer',
      label: isRu ? 'Компьютер' : 'Computer',
      appId: 'my-computer',
      icon: assets.computerIcon,
    },
    {
      id: 'control-panel',
      label: isRu ? 'Панель управления' : 'Control Panel',
      appId: 'control-panel',
      icon: assets.controlPanelIcon,
    },
    {
      id: 'devices-printers',
      label: isRu ? 'Устройства и принтеры' : 'Devices and Printers',
      appId: 'control-panel',
      icon: assets.placesIcons.printers ?? assets.controlPanelIcon,
    },
    {
      id: 'default-programs',
      label: isRu ? 'Программы по умолчанию' : 'Default Programs',
      appId: 'all-programs',
    },
    {
      id: 'help',
      label: isRu ? 'Справка и поддержка' : 'Help and Support',
      appId: 'help',
    },
  ];

  if (!vista) return { programs, allPrograms, places, separatorAfter: ['music', 'games', 'devices-printers'] };

  // Windows Vista: two pinned entries with a second line, then the rest; the places column starts with the user.
  const pinnedLabels: Record<string, [string, string]> = {
    'internet-explorer': [vistaText(language, 'internet'), 'Internet Explorer'],
    outlook: [vistaText(language, 'email'), vistaText(language, 'windowsMail')],
  };
  const vistaPrograms = programs.map((entry) => {
    const pinned = pinnedLabels[entry.id];
    return pinned ? { ...entry, label: pinned[0], subtitle: pinned[1] } : entry;
  });
  const placeById = (id: string) => places.find((entry) => entry.id === id) as Win7MenuEntry;
  const vistaPlaces: Win7MenuEntry[] = [
    { id: 'user', label: account, path: 'C:\\Users\\C4m1r', icon: assets.placesIcons.myDocuments ?? assets.folderIcon },
    placeById('documents'),
    placeById('pictures'),
    placeById('music'),
    placeById('games'),
    { id: 'recent', label: vistaText(language, 'recentItems'), disabled: true },
    placeById('computer'),
    { id: 'network', label: vistaText(language, 'network'), appId: 'network-neighborhood', icon: assets.computerIcon },
    { id: 'connect-to', label: vistaText(language, 'connectTo'), disabled: true },
    placeById('control-panel'),
    placeById('default-programs'),
    placeById('help'),
  ];
  return { programs: vistaPrograms, allPrograms, places: vistaPlaces, separatorAfter: ['user', 'games', 'recent', 'connect-to'] };
}
