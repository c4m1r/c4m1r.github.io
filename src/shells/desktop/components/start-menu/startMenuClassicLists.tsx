import { startMenuFolderNodes, startMenuProgramsPath, type StartMenuNode } from './startMenuModel';
import ieClassicIcon from '../../../../themes/win98/icons/network/msie1/16x16-3.png';
import outlookClassicIcon from '../../../../themes/win98/icons/network/mailbox-world/16x16-1.png';
import mediaPlayerClassicIcon from '../../../../themes/win98/icons/media/media-player/16x16-1.png';
import programsClassicIcon from '../../../../themes/win98/icons/folders/directory-closed/16x16-1.png';
import documentsClassicIcon from '../../../../themes/win98/icons/documents/directory-open-file-mydocs/16x16-2.png';
import settingsClassicIcon from '../../../../themes/win98/icons/folders/directory-control-panel/16x16-1.png';
import findClassicIcon from '../../../../themes/win98/icons/devices/search-computer/16x16-1.png';
import helpClassicIcon from '../../../../themes/win98/icons/devices/help-book-computer/16x16-1.png';
import programs32Icon from '../../../../themes/win98/icons/apps/program-manager/32x32-0.png';
import documents32Icon from '../../../../themes/win98/icons/documents/directory-open-file-mydocs-small/32x32-3.png';
import settings32Icon from '../../../../themes/win98/icons/system/settings-gear/32x32-3.png';
import find32Icon from '../../../../themes/win98/icons/documents/search-file-2/32x32-3.png';
import help32Icon from '../../../../themes/win98/icons/documents/help-book-small/32x32-3.png';
import run32Icon from '../../../../themes/win98/icons/apps/application-hourglass-small/32x32-3.png';
import suspend32Icon from '../../../../themes/win98/icons/devices/standby-monitor-moon/32x32-2.png';
import shutDown32Icon from '../../../../themes/win98/icons/system/shut-down-normal/32x32-3.png';
import msDos16Icon from '../../../../themes/win98/icons/apps/ms-dos-2/16x16-1.png';
import explorer16Icon from '../../../../themes/win98/icons/folders/directory-explorer/16x16-3.png';
import logOffIcon from '../../../../themes/win98/icons/system/shut-down-cool/16x16-3.png';
import shutDownClassicIcon from '../../../../themes/win98/icons/system/shut-down-cool/16x16-2.png';
import accessoriesClassicIcon from '../../../../themes/win98/icons/folders/directory-closed/16x16-1.png';
import calculatorIcon from '../../../../themes/win98/icons/apps/calculator/16x16-1.png';
import notepadClassicIcon from '../../../../themes/win98/icons/documents/notepad/16x16-0.png';
import paintClassicIcon from '../../../../themes/win98/icons/apps/paint-old/16x16-1.png';
import minesweeperIcon from '../../../../themes/win98/icons/apps/game-mine-1/16x16-1.png';
import documentIcon from '../../../../themes/win98/icons/documents/document/16x16-1.png';
import win2000ProgramsIcon from '../../../../themes/win2000/icons/start-menu/programs-16.png';
import win2000AccessoriesIcon from '../../../../themes/win2000/icons/start-menu/accessories-16.png';
import win2000DocumentsIcon from '../../../../themes/win2000/icons/start-menu/documents-16.png';
import win2000SettingsIcon from '../../../../themes/win2000/icons/start-menu/settings-16.png';
import win2000FindIcon from '../../../../themes/win2000/icons/start-menu/find-16.png';
import win2000HelpIcon from '../../../../themes/win2000/icons/start-menu/help-16.png';
import win2000RunIcon from '../../../../themes/win2000/icons/start-menu/run-16.png';
import win2000ShutDownIcon from '../../../../themes/win2000/icons/start-menu/shutdown-16.png';
import win2000UpdateIcon from '../../../../themes/win2000/icons/start-menu/update-16.png';
import win2000IeIcon from '../../../../themes/win2000/icons/start-menu/internet-explorer-16.png';
import win2000NotepadIcon from '../../../../themes/win2000/icons/start-menu/notepad-16.png';
import win2000PaintIcon from '../../../../themes/win2000/icons/start-menu/paint-16.png';
import win2000MediaPlayerIcon from '../../../../themes/win2000/icons/start-menu/media-player-16.png';
import win2000Programs32Icon from '../../../../themes/win2000/icons/start-menu/programs-32.png';
import win2000Documents32Icon from '../../../../themes/win2000/icons/start-menu/documents-32.png';
import win2000Settings32Icon from '../../../../themes/win2000/icons/start-menu/settings-32.png';
import win2000Find32Icon from '../../../../themes/win2000/icons/start-menu/find-32.png';
import win2000Help32Icon from '../../../../themes/win2000/icons/start-menu/help-32.png';
import win2000Run32Icon from '../../../../themes/win2000/icons/start-menu/run-32.png';
import win2000Shutdown32Icon from '../../../../themes/win2000/icons/start-menu/shutdown-32.png';
import { WIN95_START_ICONS } from '../../../../themes/win95';

/**
 * The classic Start menu list (Windows 98 and 2000). Icons follow the skin, and the list is built
 * from the shared Start menu model, so the component only draws it.
 */

export type ClassicMenuItem = StartMenuNode;

const DOCUMENTS_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents';

// Icons are drawn at the size of their own file, never scaled: a scaled icon looks soft.
const classicIcon = (src: string, size: 16 | 32 = 16) => (
  <img src={src} alt="" width={size} height={size} style={{ imageRendering: 'pixelated' }} />
);

export function buildClassicStartMenu({ isWin2000, isWin95 = false, isRu, account }: { isWin2000: boolean; isWin95?: boolean; isRu: boolean; account: string }): ClassicMenuItem[] {
  // Windows 2000 gets its own shell icons for the roles the native ICO set covers;
  // the rest fall back to the Windows 98 artwork until they are identified.
  const programsIcon = isWin2000 ? win2000ProgramsIcon : programsClassicIcon;
  const accessoriesIcon = isWin2000 ? win2000AccessoriesIcon : accessoriesClassicIcon;
  const documentsIcon = isWin2000 ? win2000DocumentsIcon : isWin95 ? WIN95_START_ICONS.documents16 : documentsClassicIcon;
  const settingsIcon = isWin2000 ? win2000SettingsIcon : isWin95 ? WIN95_START_ICONS.controlPanel16 : settingsClassicIcon;
  const findIcon = isWin2000 ? win2000FindIcon : findClassicIcon;
  const helpIcon = isWin2000 ? win2000HelpIcon : helpClassicIcon;
  const runIcon = isWin2000 ? win2000RunIcon : isWin95 ? WIN95_START_ICONS.run16 : run32Icon;
  const shutDownIcon = isWin2000 ? win2000ShutDownIcon : shutDownClassicIcon;
  const ieIcon = isWin2000 ? win2000IeIcon : isWin95 ? WIN95_START_ICONS.internetExplorer16 : ieClassicIcon;
  const notepadIcon = isWin2000 ? win2000NotepadIcon : isWin95 ? WIN95_START_ICONS.notepad16 : notepadClassicIcon;
  const paintIcon = isWin2000 ? win2000PaintIcon : paintClassicIcon;
  const mediaPlayerIcon = isWin2000 ? win2000MediaPlayerIcon : mediaPlayerClassicIcon;
  // Top-level rows use 32 px shell art: the native Windows 2000 bitmaps on 2000, the Windows 98 art on 98.
  const win2000Top: Record<string, string> = {
    [programs32Icon]: win2000Programs32Icon,
    [documents32Icon]: win2000Documents32Icon,
    [settings32Icon]: win2000Settings32Icon,
    [find32Icon]: win2000Find32Icon,
    [help32Icon]: win2000Help32Icon,
    [run32Icon]: win2000Run32Icon,
    [shutDown32Icon]: win2000Shutdown32Icon,
  };
  // Windows 95 top-level rows use the Windows 95 art for the roles it has, and keep the Windows 98 art elsewhere.
  const win95Top: Record<string, string> = {
    [documents32Icon]: WIN95_START_ICONS.documents32,
    [settings32Icon]: WIN95_START_ICONS.controlPanel32,
    [run32Icon]: WIN95_START_ICONS.run32,
  };
  const topIcon = (_src16: string, src32: string) => classicIcon(isWin2000 ? (win2000Top[src32] ?? src32) : isWin95 ? (win95Top[src32] ?? src32) : src32, 32);


  // Entries the user placed in Start Menu\Programs (including the StartUp folder) come from the file system.
  // Known applications keep this skin's own art; other entries fall back to the file system icon.
  const classicAppIcons: Record<string, string> = {
    calculator: calculatorIcon,
    notepad: notepadClassicIcon,
    paint: paintClassicIcon,
    minesweeper: minesweeperIcon,
    'windows-media-player': mediaPlayerClassicIcon,
    winamp: mediaPlayerClassicIcon,
    'control-panel': settingsClassicIcon,
  };
  const userPrograms = startMenuFolderNodes(startMenuProgramsPath(account), (src, kind, appId) => {
    const own = appId ? classicAppIcons[appId] : undefined;
    return classicIcon(own ?? src ?? (kind === 'folder' ? programsClassicIcon : documentIcon));
  });


  const menuItems: ClassicMenuItem[] = [
    ...(isWin2000 ? [
      { label: 'Windows Update', icon: classicIcon(win2000UpdateIcon) },
      { label: '', icon: null, separator: true },
    ] : []),
    { label: isRu ? 'Программы' : 'Programs', icon: topIcon(programsIcon, programs32Icon), submenu: isWin2000 ? [
      { label: 'Internet Explorer', icon: classicIcon(ieIcon), appId: 'internet-explorer' },
      { label: 'Outlook Express', icon: classicIcon(outlookClassicIcon), appId: 'outlook' },
      { label: isRu ? 'Стандартные' : 'Accessories', icon: classicIcon(accessoriesIcon), submenu: [
        { label: isRu ? 'Калькулятор' : 'Calculator', icon: classicIcon(calculatorIcon), appId: 'calculator' },
        { label: isRu ? 'Блокнот' : 'Notepad', icon: classicIcon(notepadIcon), appId: 'notepad' },
        { label: isRu ? 'Paint' : 'Paint', icon: classicIcon(paintIcon), appId: 'paint' },
        { label: isRu ? 'Панель управления' : 'Control Panel', icon: classicIcon(settingsIcon), appId: 'control-panel' },
      ] },
      { label: isRu ? 'Мультимедиа' : 'Entertainment', icon: classicIcon(mediaPlayerIcon), submenu: [
        { label: 'Windows Media Player', icon: classicIcon(mediaPlayerIcon), appId: 'windows-media-player' },
        { label: 'Winamp', icon: classicIcon(mediaPlayerIcon), appId: 'winamp' },
      ] },
      { label: isRu ? 'Игры' : 'Games', icon: classicIcon(minesweeperIcon), submenu: [
        { label: isRu ? 'Сапёр' : 'Minesweeper', icon: classicIcon(minesweeperIcon), appId: 'minesweeper' },
        { label: 'DOOM', icon: classicIcon(documentIcon), appId: 'doom1' },
        { label: 'DOOM II', icon: classicIcon(documentIcon), appId: 'doom2' },
      ] },
      ...userPrograms,
    ] : [
      // Windows 98 list as in the reference: Accessories (with Games and Entertainment inside),
      // MS-DOS Prompt, Windows Explorer.
      { label: isRu ? 'Стандартные' : 'Accessories', icon: classicIcon(accessoriesIcon), submenu: [
        { label: isRu ? 'Калькулятор' : 'Calculator', icon: classicIcon(calculatorIcon), appId: 'calculator' },
        { label: isRu ? 'Блокнот' : 'Notepad', icon: classicIcon(notepadIcon), appId: 'notepad' },
        { label: isRu ? 'Paint' : 'Paint', icon: classicIcon(paintIcon), appId: 'paint' },
        { label: isRu ? 'Панель управления' : 'Control Panel', icon: classicIcon(settingsIcon), appId: 'control-panel' },
        { label: isRu ? 'Мультимедиа' : 'Entertainment', icon: classicIcon(mediaPlayerIcon), submenu: [
          { label: 'Windows Media Player', icon: classicIcon(mediaPlayerIcon), appId: 'windows-media-player' },
          { label: 'Winamp', icon: classicIcon(mediaPlayerIcon), appId: 'winamp' },
        ] },
        { label: isRu ? 'Игры' : 'Games', icon: classicIcon(minesweeperIcon), submenu: [
          { label: isRu ? 'Сапёр' : 'Minesweeper', icon: classicIcon(minesweeperIcon), appId: 'minesweeper' },
          { label: 'DOOM', icon: classicIcon(documentIcon), appId: 'doom1' },
          { label: 'DOOM II', icon: classicIcon(documentIcon), appId: 'doom2' },
        ] },
      ] },
      ...userPrograms,
      { label: 'MS-DOS Prompt', icon: classicIcon(msDos16Icon), appId: 'terminal' },
      { label: 'Windows Explorer', icon: classicIcon(explorer16Icon), path: 'My Computer' },
    ] },
    { label: isRu ? 'Документы' : 'Documents', icon: topIcon(documentsIcon, documents32Icon), path: DOCUMENTS_PATH },
    { label: isRu ? 'Настройка' : 'Settings', icon: topIcon(settingsIcon, settings32Icon), submenu: [
      { label: isRu ? 'Панель управления' : 'Control Panel', icon: classicIcon(settingsIcon), appId: 'control-panel' },
    ] },
    { label: isWin2000 ? (isRu ? 'Поиск' : 'Search') : (isRu ? 'Найти' : 'Find'), icon: topIcon(findIcon, find32Icon), submenu: [
      { label: isRu ? 'Файлы или папки...' : 'Files or Folders...', icon: classicIcon(findIcon), appId: 'search' },
    ] },
    { label: isRu ? 'Справка' : 'Help', icon: topIcon(helpIcon, help32Icon), appId: 'wiki' },
    { label: isRu ? 'Выполнить...' : 'Run...', icon: topIcon(runIcon, run32Icon), appId: 'run' },
    { label: '', icon: null, separator: true },
    // Windows 98 offers Suspend (goes to the sign-in screen); Windows 2000
    // ends with Shut Down alone, as in the reference screenshot.
    ...(isWin2000 || isWin95 ? [] : [{ label: isRu ? 'Приостановить' : 'Suspend', icon: topIcon(logOffIcon, suspend32Icon), action: 'logoff' as const }]),
    { label: isRu ? 'Завершение работы...' : 'Shut Down...', icon: topIcon(shutDownIcon, shutDown32Icon), action: 'shutdown' },
  ];

  return menuItems;
}
