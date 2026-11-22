import { startMenuFolderNodes, startMenuProgramsPath, type StartMenuNode } from './startMenuModel';
import ieClassicIcon from '../../../../themes/win98/icons/network/msie1/16x16-3.png';
import outlookClassicIcon from '../../../../themes/win98/icons/network/mailbox-world/16x16-1.png';
import mediaPlayerClassicIcon from '../../../../themes/win98/icons/media/media-player/16x16-1.png';
import programsClassicIcon from '../../../../themes/win98/icons/folders/directory-closed/16x16-1.png';
import documentsClassicIcon from '../../../../themes/win98/icons/documents/directory-open-file-mydocs/16x16-2.png';
import settingsClassicIcon from '../../../../themes/win98/icons/folders/directory-control-panel/16x16-1.png';
import findClassicIcon from '../../../../themes/win98/icons/devices/search-computer/16x16-1.png';
import helpClassicIcon from '../../../../themes/win98/icons/devices/help-book-computer/16x16-1.png';
import runClassicIcon from '../../../../themes/win98/icons/apps/ms-dos/32x32-0.png';
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

/**
 * The classic Start menu list (Windows 98 and 2000). Icons follow the skin, and the list is built
 * from the shared Start menu model, so the component only draws it.
 */

export type ClassicMenuItem = StartMenuNode;

const DOCUMENTS_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents';

const classicIcon = (src: string) => <img src={src} alt="" className="h-4 w-4 object-contain" />;

export function buildClassicStartMenu({ isWin2000, isRu, account }: { isWin2000: boolean; isRu: boolean; account: string }): ClassicMenuItem[] {
  // Windows 2000 gets its own shell icons for the roles the native ICO set covers;
  // the rest fall back to the Windows 98 artwork until they are identified.
  const programsIcon = isWin2000 ? win2000ProgramsIcon : programsClassicIcon;
  const accessoriesIcon = isWin2000 ? win2000AccessoriesIcon : accessoriesClassicIcon;
  const documentsIcon = isWin2000 ? win2000DocumentsIcon : documentsClassicIcon;
  const settingsIcon = isWin2000 ? win2000SettingsIcon : settingsClassicIcon;
  const findIcon = isWin2000 ? win2000FindIcon : findClassicIcon;
  const helpIcon = isWin2000 ? win2000HelpIcon : helpClassicIcon;
  const runIcon = isWin2000 ? win2000RunIcon : runClassicIcon;
  const shutDownIcon = isWin2000 ? win2000ShutDownIcon : shutDownClassicIcon;
  const ieIcon = isWin2000 ? win2000IeIcon : ieClassicIcon;
  const notepadIcon = isWin2000 ? win2000NotepadIcon : notepadClassicIcon;
  const paintIcon = isWin2000 ? win2000PaintIcon : paintClassicIcon;
  const mediaPlayerIcon = isWin2000 ? win2000MediaPlayerIcon : mediaPlayerClassicIcon;


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
    { label: isRu ? 'Программы' : 'Programs', icon: classicIcon(programsIcon), submenu: isWin2000 ? [
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
      { label: 'MS-DOS Prompt', icon: classicIcon(runClassicIcon), appId: 'terminal' },
      { label: 'Windows Explorer', icon: classicIcon(programsClassicIcon), path: 'My Computer' },
    ] },
    { label: isRu ? 'Документы' : 'Documents', icon: classicIcon(documentsIcon), path: DOCUMENTS_PATH },
    { label: isRu ? 'Настройка' : 'Settings', icon: classicIcon(settingsIcon), submenu: [
      { label: isRu ? 'Панель управления' : 'Control Panel', icon: classicIcon(settingsIcon), appId: 'control-panel' },
    ] },
    { label: isWin2000 ? (isRu ? 'Поиск' : 'Search') : (isRu ? 'Найти' : 'Find'), icon: classicIcon(findIcon), submenu: [
      { label: isRu ? 'Файлы или папки...' : 'Files or Folders...', icon: classicIcon(findIcon), appId: 'search' },
    ] },
    { label: isRu ? 'Справка' : 'Help', icon: classicIcon(helpIcon), appId: 'wiki' },
    { label: isRu ? 'Выполнить...' : 'Run...', icon: classicIcon(runIcon), appId: 'run' },
    { label: '', icon: null, separator: true },
    // Windows 98 offers Suspend (goes to the sign-in screen); Windows 2000
    // ends with Shut Down alone, as in the reference screenshot.
    ...(isWin2000 ? [] : [{ label: isRu ? 'Приостановить' : 'Suspend', icon: classicIcon(logOffIcon), action: 'logoff' as const }]),
    { label: isRu ? 'Завершение работы...' : 'Shut Down...', icon: classicIcon(shutDownIcon), action: 'shutdown' },
  ];

  return menuItems;
}
