import { appRegistry } from '../../appRegistry';
import helpIcon from '../../../../themes/winxp/assets/icons/help.png';
import searchIcon from '../../../../themes/winxp/assets/icons/search.png';
import runIcon from '../../../../themes/winxp/assets/icons/run.png';
import printersIcon from '../../../../themes/winxp/assets/icons/printerfax.png';
import recentDocIcon from '../../../../themes/winxp/assets/icons/recentdoc.png';
import picturesIcon from '../../../../themes/winxp/assets/icons/folder_image.png';
import musicIcon from '../../../../themes/winxp/assets/icons/folder_music.png';
import defaultProgIcon from '../../../../themes/winxp/assets/icons/defaultprog.png';
import { translations } from '../../../../i18n/translations';
import type { Language } from '../../../../i18n/translations';
import type { ThemeAssets } from '../../../../themes/webos/themeAssets';

/**
 * The fixed lists of the Windows XP Start menu: pinned programs, All Programs, frequently used
 * programs and the places column. They are built from the active theme's assets and the app
 * registry; the component only renders them.
 */

export type MenuItem = {
  id: string;
  submenu?: MenuItem[];
  title?: string;
  subtitle?: string;
  icon?: string;
  appId?: string;
  path?: string;
  url?: string;
  disabled?: boolean;
  isSeparator?: boolean;
};

const MY_DOCUMENTS_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents';
const MY_RECENT_PATH = 'C:\\Documents and Settings\\C4m1r\\Recent';
const MY_PICTURES_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Pictures';
const MY_MUSIC_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Music';
const MY_VIDEOS_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Videos';

export interface XpStartMenuListContext {
  isRu: boolean;
  language: Language;
  gamesTitle: string;
  themeAssets: ThemeAssets;
}

export function buildXpStartMenuLists({ isRu, language, gamesTitle, themeAssets }: XpStartMenuListContext) {
  const startMenuIcons = themeAssets.startMenuIcons;
  const placeIcons = themeAssets.placesIcons ?? {};
  const fallbackIcon = themeAssets.folderIcon ?? themeAssets.projectsIcon;
  const t = translations[language].xp;

  const pinnedPrograms: MenuItem[] = [
    {
      id: 'internet-explorer',
      title: appRegistry['internet-explorer']?.title[language] || 'Internet Explorer',
      icon: startMenuIcons.internetExplorer ?? themeAssets.internetExplorerIcon,
      appId: 'internet-explorer',
    },
    {
      id: 'outlook',
      title: appRegistry.outlook?.title[language] || 'Outlook Express',
      icon: startMenuIcons.outlook ?? themeAssets.mailIcon,
      appId: 'outlook',
    },
    {
      id: 'windows-media-player',
      title: appRegistry['windows-media-player']?.title[language] || 'Windows Media Player',
      icon: startMenuIcons.windowsMediaPlayer ?? themeAssets.mediaPlayerIcon,
      appId: 'windows-media-player',
    },
    {
      id: 'projects-grid',
      title: t.myProjects ?? (isRu ? 'Мои Проекты' : 'My Projects'),
      icon: startMenuIcons.projects ?? themeAssets.projectsIcon ?? fallbackIcon,
      appId: 'projects-grid',
    },
    {
      id: 'paint',
      title: appRegistry['paint']?.title[language] || 'Paint',
      icon: startMenuIcons.paint ?? themeAssets.paintIcon ?? themeAssets.folderIcon,
      appId: 'paint',
    },
  ];

  const allProgramsEntries: MenuItem[] = [
    { id: 'internet-explorer', title: 'Internet Explorer', icon: startMenuIcons.internetExplorer ?? themeAssets.internetExplorerIcon, appId: 'internet-explorer' },
    { id: 'outlook', title: 'Outlook Express', icon: startMenuIcons.outlook ?? themeAssets.mailIcon, appId: 'outlook' },
    { id: 'windows-media-player', title: 'Windows Media Player', icon: startMenuIcons.windowsMediaPlayer ?? themeAssets.mediaPlayerIcon, appId: 'windows-media-player' },
    { id: 'winamp', title: 'Winamp', icon: themeAssets.winampIcon ?? themeAssets.mediaPlayerIcon, appId: 'winamp' },
    { id: 'paint', title: 'Paint', icon: startMenuIcons.paint ?? themeAssets.paintIcon, appId: 'paint' },
    { id: 'calculator', title: isRu ? 'Калькулятор' : 'Calculator', icon: startMenuIcons.calculator ?? themeAssets.calculatorIcon, appId: 'calculator' },
    { id: 'notepad', title: isRu ? 'Блокнот' : 'Notepad', icon: themeAssets.notepadIcon, appId: 'notepad' },
    { id: 'pictures', title: isRu ? 'Просмотр изображений' : 'Picture Viewer', icon: themeAssets.projectsIcon, appId: 'pictures' },
    { id: 'calendar', title: isRu ? 'Календарь' : 'Calendar', icon: themeAssets.notepadIcon, appId: 'calendar' },
    { id: 'alarm', title: isRu ? 'Будильник' : 'Alarm', icon: themeAssets.alarmIcon ?? themeAssets.notepadIcon, appId: 'alarm' },
    { id: 'control-panel', title: isRu ? 'Панель управления' : 'Control Panel', icon: placeIcons.controlPanel ?? fallbackIcon, appId: 'control-panel' },
    { id: 'task-manager', title: isRu ? 'Диспетчер задач' : 'Task Manager', icon: placeIcons.controlPanel ?? fallbackIcon, appId: 'task-manager' },
    { id: 'news', title: isRu ? 'Лента новостей RSS' : 'News RSS Feed', icon: themeAssets.newsIcon, appId: 'news' },
    { id: 'currency', title: isRu ? 'Курсы валют' : 'Market Rates', icon: themeAssets.currencyIcon, appId: 'currency' },
    { id: 'wiki', title: 'Wiki', icon: themeAssets.projectsIcon, appId: 'wiki' },
    { id: 'help', title: isRu ? 'Справка и поддержка' : 'Help and Support', icon: helpIcon, appId: 'help' },
    { id: 'terminal', title: isRu ? 'Терминал' : 'Terminal', icon: themeAssets.notepadIcon, appId: 'terminal' },
    { id: 'loops', title: 'Loops', icon: themeAssets.mediaPlayerIcon, appId: 'loops' },
    { id: 'projects-grid', title: isRu ? 'Мои проекты' : 'My Projects', icon: themeAssets.projectsIcon, appId: 'projects-grid' },
    { id: 'minesweeper', title: isRu ? 'Сапёр' : 'Minesweeper', icon: themeAssets.minesweeperIcon, appId: 'minesweeper' },
    { id: 'snake', title: isRu ? 'Змейка' : 'Snake', icon: themeAssets.gamesIcon, appId: 'snake' },
    { id: 'memory', title: isRu ? 'Память' : 'Memory', icon: themeAssets.gamesIcon, appId: 'memory' },
    { id: 'doom1', title: 'DOOM', icon: themeAssets.doomIcon, appId: 'doom1' },
    { id: 'doom2', title: 'DOOM II', icon: themeAssets.doomIcon, appId: 'doom2' },
  ];

  const frequentPrograms: MenuItem[] = [
    {
      id: 'games-folder',
      title: gamesTitle,
      icon: themeAssets.gamesFolderIcon ?? startMenuIcons.games ?? themeAssets.gamesIcon,
      path: 'C:\\Program Files',
    },
    {
      id: 'calculator',
      title: appRegistry['calculator']?.title[language] || 'Calculator',
      icon: startMenuIcons.calculator ?? themeAssets.calculatorIcon ?? themeAssets.folderIcon,
      appId: 'calculator',
    },
    {
      id: 'minesweeper',
      title: appRegistry['minesweeper']?.title[language] || 'Minesweeper',
      icon: startMenuIcons.minesweeper ?? themeAssets.minesweeperIcon,
      appId: 'minesweeper',
    },
    {
      id: 'news',
      title: appRegistry['news']?.title[language] || (isRu ? 'Лента новостей RSS' : 'News RSS Feed'),
      icon: themeAssets.newsIcon,
      appId: 'news',
    },
    {
      id: 'currency',
      title: appRegistry['currency']?.title[language] || (isRu ? 'Курсы валют' : 'Market Rates'),
      icon: themeAssets.currencyIcon,
      appId: 'currency',
    },
    {
      id: 'my-computer',
      title: t.myComputer || (isRu ? 'Мой компьютер' : 'My Computer'),
      icon: placeIcons.myComputer ?? themeAssets.computerIcon ?? fallbackIcon,
      appId: 'my-computer',
    },
  ];

  const placesLinks: MenuItem[] = [
    {
      id: 'my-documents',
      title: t.myDocuments || (isRu ? 'Мои документы' : 'My Documents'),
      icon: placeIcons.myDocuments ?? themeAssets.folderIcon,
      path: MY_DOCUMENTS_PATH,
    },
    {
      id: 'recent-documents',
      title: isRu ? 'Недавние документы' : 'My Recent Documents',
      icon: placeIcons.recentDocuments ?? recentDocIcon,
      path: MY_RECENT_PATH,
    },
    {
      id: 'my-pictures',
      title: isRu ? 'Мои рисунки' : 'My Pictures',
      icon: placeIcons.myPictures ?? picturesIcon,
      path: MY_PICTURES_PATH,
    },
    {
      id: 'my-music',
      title: isRu ? 'Моя музыка' : 'My Music',
      icon: placeIcons.myMusic ?? musicIcon,
      path: MY_MUSIC_PATH,
    },
    {
      id: 'my-videos',
      title: isRu ? 'Мои видеозаписи' : 'My Videos',
      icon: themeAssets.folderIcon ?? fallbackIcon,
      path: MY_VIDEOS_PATH,
    },
    {
      id: 'my-computer',
      title: t.myComputer || (isRu ? 'Мой компьютер' : 'My Computer'),
      icon: placeIcons.myComputer ?? themeAssets.computerIcon,
      appId: 'my-computer',
    },
    {
      id: 'network-neighborhood',
      title: isRu ? 'Сетевое окружение' : 'My Network Places',
      icon: placeIcons.connectTo ?? themeAssets.computerIcon,
      appId: 'network-neighborhood',
    },
    {
      id: 'control-panel',
      title: appRegistry['control-panel']?.title[language] || (isRu ? 'Панель управления' : 'Control Panel'),
      icon: placeIcons.controlPanel ?? fallbackIcon,
      appId: 'control-panel',
    },
    {
      id: 'program-access',
      title: isRu ? 'Выбор программ по умолчанию' : 'Set Program Access and Defaults',
      icon: placeIcons.programAccess ?? defaultProgIcon,
      path: 'C:\\Program Files',
    },
    {
      id: 'connect-to',
      title: isRu ? 'Подключение' : 'Connect To',
      icon: placeIcons.connectTo ?? fallbackIcon,
      path: 'My Computer\\Network Neighborhood',
    },
    {
      id: 'printers',
      title: isRu ? 'Принтеры и факсы' : 'Printers and Faxes',
      icon: placeIcons.printers ?? printersIcon,
      appId: 'control-panel',
    },
    { id: 'separator-places', isSeparator: true },
    {
      id: 'help',
      title: isRu ? 'Справка и поддержка' : 'Help and Support',
      icon: placeIcons.help ?? helpIcon,
      appId: 'help',
    },
    {
      id: 'search',
      title: isRu ? 'Поиск' : 'Search',
      icon: placeIcons.search ?? searchIcon,
      appId: 'search',
      disabled: false,
    },
    {
      id: 'run',
      title: isRu ? 'Выполнить...' : 'Run...',
      icon: placeIcons.run ?? runIcon,
      appId: 'run',
      disabled: false,
    },
  ];

  return { pinnedPrograms, allProgramsEntries, frequentPrograms, placesLinks };
}
