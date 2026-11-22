import { cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from 'react';
import { useApp } from '../../../../contexts/useApp';
import { getSessionAccount } from '../../../../domain/auth/session';
import { startMenuFolderNodes, startMenuProgramsPath, type StartMenuNode } from './startMenuModel';
import { getActiveEdition } from '../../../os/osEditions';
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

export interface StartMenu98Props {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
}

type ClassicMenuItem = StartMenuNode;

const DOCUMENTS_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents';

const classicIcon = (src: string) => <img src={src} alt="" className="h-4 w-4 object-contain" />;

// Start menu surface used by Windows 98 and 2000. The XP menu lives in StartMenuXP.tsx;
// this file keeps the classic structure: Programs / Favorites / Documents / Settings /
// Find / Help / Run, a separator, then Log Off and Shut Down.
export function StartMenu98({ onClose, onLaunchApp, onOpenPath, onSystemCommand, onHover }: StartMenu98Props) {
  const { theme, language } = useApp();
  const account = getSessionAccount();
  const isRu = language === 'ru';
  const isWin2000 = theme === 'win2000';
  const [openChain, setOpenChain] = useState<string[]>([]);
  const activeEdition = getActiveEdition(theme);

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
  const userPrograms = startMenuFolderNodes(startMenuProgramsPath(account), (src, kind) =>
    classicIcon(src ?? (kind === 'folder' ? programsClassicIcon : documentIcon)),
  );

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
    ...(isWin2000 ? [] : [{ label: isRu ? 'Приостановить' : 'Suspend', icon: classicIcon(logOffIcon), action: 'logoff' }]),
    { label: isRu ? 'Завершение работы...' : 'Shut Down...', icon: classicIcon(shutDownIcon), action: 'shutdown' },
  ];

  const activate = (item: ClassicMenuItem) => {
    if (item.action) onSystemCommand?.(item.action);
    else if (item.appId) onLaunchApp?.(item.appId);
    else if (item.path) onOpenPath?.(item.path);
    onClose();
  };

  // openChain holds the labels of the open submenus, outermost first. Hovering or
  // clicking an item at a given depth replaces the chain from that depth onwards.
  const openAt = (depth: number, label: string | null) => {
    setOpenChain((prev) => (label === null ? prev.slice(0, depth) : [...prev.slice(0, depth), label]));
  };

  // Windows 98 top-level rows use 32 px icons at a 33 px pitch (reference); Windows 2000 uses
  // 24 px icons. Submenus stay at 16 px.
  const topIconClass = isWin2000 ? 'h-6 w-6 object-contain' : 'h-8 w-8 object-contain';
  const iconForDepth = (icon: ReactNode, depth: number): ReactNode =>
    depth === 0 && isValidElement(icon)
      ? cloneElement(icon as ReactElement<{ className?: string }>, { className: topIconClass })
      : icon;

  const renderItems = (items: ClassicMenuItem[], depth: number) => (
    <>
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={`sep-${index}`} className="my-1 mx-1 border-t border-[#808080] border-b border-white" />;
        }
        const isOpen = !!item.submenu && openChain[depth] === item.label;
        return (
          <div key={item.label} className="relative">
            <button
              type="button"
              className={`w-full text-left px-2 flex items-center gap-2 os-list-item os-button ${isOpen ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'}`}
              style={{
                fontFamily: 'MS Sans Serif, sans-serif',
                fontSize: 12,
                lineHeight: '16px',
                padding: depth === 0 ? (isWin2000 ? '6px 8px' : '0 8px') : '3px 8px',
                minHeight: depth === 0 ? (isWin2000 ? 32 : 33) : 22,
              }}
              onClick={() => (item.submenu ? openAt(depth, isOpen ? null : item.label) : activate(item))}
              onMouseEnter={() => {
                onHover?.();
                openAt(depth, item.submenu ? item.label : null);
              }}
              aria-expanded={item.submenu ? isOpen : undefined}
            >
              {iconForDepth(item.icon, depth)}
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
              {item.submenu ? <span aria-hidden="true">›</span> : null}
            </button>
            {isOpen && item.submenu && (
              <div
                className="absolute left-full top-0 z-[100001] min-w-52 py-1"
                style={{
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#ffffff #000000 #000000 #ffffff',
                  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                {renderItems(item.submenu, depth + 1)}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div
      className={`absolute bottom-[28px] ${isWin2000 ? 'left-0' : 'left-1'} w-52 flex z-50 os-panel`}
      style={{
        background: '#c0c0c0',
        border: '2px solid',
        borderColor: '#ffffff #000000 #000000 #ffffff',
        boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* .os-sidebar carries a global 200px width for file-explorer sidebars; the
          inline width keeps the classic 32px strip and stops it squeezing the list. */}
      <div
        className="flex items-end justify-center pb-2 os-sidebar select-none"
        style={{
          width: 32,
          flexShrink: 0,
          flexDirection: 'row',
          // Reference: Windows 2000 is a black top fading to blue; Windows 98 is solid navy.
          background: isWin2000 ? 'linear-gradient(to bottom, #000000 0%, #000000 30%, #0000a8 100%)' : '#000080',
        }}
      >
        <span
          className="text-white whitespace-nowrap"
          style={{
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: isWin2000 ? 20 : 22,
            lineHeight: 1,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            letterSpacing: isWin2000 ? 0 : '-0.5px',
            paddingBottom: 4,
          }}
        >
          {isWin2000 ? (
            <><b>Windows 2000</b>{' '}<span className="font-normal">Professional</span></>
          ) : activeEdition?.id === 'second-edition' ? (
            <><b>Windows</b><span className="font-normal">98</span><span className="font-bold text-xs ml-1 text-yellow-300">SE</span></>
          ) : (
            <><b>Windows</b><span className="font-normal">98</span></>
          )}
        </span>
      </div>
      {/* The shared .os-list is a scroll box; the classic menu sizes to its items instead. */}
      <div className="flex-1 min-w-0 py-1 os-list" style={{ overflow: 'visible', height: 'auto' }}>
        {renderItems(menuItems, 0)}
      </div>
    </div>
  );
}
