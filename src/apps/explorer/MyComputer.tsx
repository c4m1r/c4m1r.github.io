import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { nextCycledViewMode, usesViewsMenu, viewMenuEntries, type ExplorerViewMode } from './explorerViews';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, Grid, List, Search } from 'lucide-react';
import folderIcon from '../../themes/winxp/assets/icons/folder_plain.png';
import computerIcon from '../../themes/winxp/assets/icons/mycomputer.png';
import searchIconXp from '../../themes/winxp/assets/toolbar/search.png';
import foldersToggleIcon from '../../themes/winxp/assets/toolbar/folders.png';
import viewThumbnailIcon from '../../themes/winxp/assets/toolbar/thumbnail.png';
import backIcon from '../../themes/winxp/assets/toolbar/back.png';
import forwardIcon from '../../themes/winxp/assets/toolbar/forward.png';
import upIcon from '../../themes/winxp/assets/toolbar/folder.png';
import goIcon from '../../themes/winxp/assets/toolbar/go.png';
import { getItemsFromPath, getFileSystemItemFromPath, FileSystemItem, initialFileSystem } from '../../utils/FileSystem';
import { resolveFileIcon } from '../../themes/iconResolver';
import appleFolderIcon from '../../themes/apple/assets/icons/folder-generic.png';
import appleDocumentIcon from '../../themes/apple/assets/sf-icons/document.svg';
import appleImageIcon from '../../themes/apple/assets/sf-icons/image.svg';
import appleDriveIcon from '../../themes/apple/assets/sf-icons/hard-drive.svg';
import win98ComputerIcon from '../../themes/win98/icons/devices/computer-explorer/16x16-0.png';
import win2000ComputerIcon from '../../themes/win98/icons/devices/computer-explorer-2k/32x32-0.png';
import win98FolderIcon from '../../themes/win98/icons/folders/directory-closed/32x32-0.png';
import win98DriveIcon from '../../themes/win98/icons/devices/hard-disk-drive/32x32-0.png';
import win98SearchIcon from '../../themes/win98/icons/devices/search-computer/32x32-0.png';
import xpFloppyIcon from '../../themes/winxp/icons/devices/floppy-disk/32x32.png';
import xpCdIcon from '../../themes/winxp/icons/devices/cd-rom/32x32.png';
import win98FloppyIcon from '../../themes/win98/icons/devices/floppy-drive-3-5-cool/32x32-2.png';
import win98CdIcon from '../../themes/win98/icons/devices/cd-drive/32x32-2.png';
import win98ControlPanelIcon from '../../themes/win98/icons/folders/directory-control-panel/32x32-2.png';
import win98PrintersIcon from '../../themes/win98/icons/devices/printer/32x32-2.png';
import win2000FloppyIcon from '../../themes/win2000/icons/devices/floppy-drive/32x32.png';
import win2000DriveIcon from '../../themes/win2000/icons/devices/drive-hdd/32x32.png';
import win2000CdIcon from '../../themes/win2000/icons/devices/cd-drive/32x32.png';
import win2000ControlPanelIcon from '../../themes/win2000/icons/system/control-panel/32x32.png';
import win2000PrintersIcon from '../../themes/win2000/icons/devices/printer/32x32.png';
import win2000ScheduledTasksIcon from '../../themes/win2000/icons/system/scheduled-tasks/32x32.png';
import win2000WebFoldersIcon from '../../themes/win2000/icons/network/web-folders/32x32.png';
import win98DialupIcon from '../../themes/win98/icons/network/directory-dial-up-networking/32x32-0.png';
import win98SchedTasksIcon from '../../themes/win98/icons/apps/sched-tasks/32x32-0.png';
import win98WebFoldersIcon from '../../themes/win98/icons/network/directory-net-web/32x32-0.png';

const isPicturesFolderPath = (value: string) => /my pictures|мои рисунки|(?:^|[\\/])pictures$/i.test(value);

export interface MyComputerProps {
  currentPath?: string;
  onOpenItem?: (item: FileSystemItem, parentPath: string) => void;
  onOpenSlideshow?: (items: FileSystemItem[], parentPath: string) => void;
  initialSearchOpen?: boolean;
}

export function MyComputer({ currentPath = 'C:\\', onOpenItem, onOpenSlideshow, initialSearchOpen = false }: MyComputerProps) {
  const { theme, language } = useApp();
  const isRu = language === 'ru';
  const [path, setPath] = useState(currentPath);
  const [history, setHistory] = useState<string[]>([currentPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  // The Recycle Bin is a shell object: its address bar reads "Recycle Bin", not the internal path.
  const addressTextFor = (value: string) => (value === 'C:\\$Recycle.Bin' ? (isRu ? 'Корзина' : 'Recycle Bin') : value);
  const [addressInput, setAddressInput] = useState(addressTextFor(currentPath));
  const isMyPictures = isPicturesFolderPath(path);
  const [viewMode, setViewMode] = useState<ExplorerViewMode>(
    isMyPictures ? 'thumbnails' : 'icons'
  );
  // Windows 2000 opens with the web-view pane; the Folders button swaps it for the folder tree.
  const [showSidebar, setShowSidebar] = useState(theme !== 'win2000');
  const [searchOpen, setSearchOpen] = useState(initialSearchOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTreePaths, setExpandedTreePaths] = useState<Record<string, boolean>>({ 'My Computer': true, 'C:\\': true });
  const [quickLookOpen, setQuickLookOpen] = useState(false);
  const [appleSearchQuery, setAppleSearchQuery] = useState('');
  const [showApplePathBar, setShowApplePathBar] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('macos-finder-path-bar') === 'true';
  });
  const [finderSidebarSize, setFinderSidebarSize] = useState<'small' | 'medium' | 'large'>(() => {
    if (typeof window === 'undefined') return 'medium';
    const saved = localStorage.getItem('macos-finder-sidebar-size');
    return saved === 'small' || saved === 'large' ? saved : 'medium';
  });
  const [showAppleStatusBar, setShowAppleStatusBar] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-finder-status-bar') !== 'false';
  });
  const isWindowsXp = theme === 'win-xp';
  const isClassicWindows = theme === 'win-98' || theme === 'win2000';
  // Classic Windows (98, 2000) and the Windows 10/11 drafts open a Views menu instead of cycling.
  const viewsMenu = usesViewsMenu(theme) ? viewMenuEntries(isRu, theme) : null;
  const [viewsMenuOpen, setViewsMenuOpen] = useState(false);
  const viewsMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!viewsMenuOpen) return;
    const closeOnOutside = (event: MouseEvent) => {
      if (viewsMenuRef.current && !viewsMenuRef.current.contains(event.target as Node)) setViewsMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [viewsMenuOpen]);
  const isAppleExplorer = theme === 'macos-26' || theme.startsWith('ios-');
  const isIosExplorer = theme.startsWith('ios-');

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    tasks: true,
    pictureTasks: true,
    places: true,
    details: true,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  useEffect(() => {
    setPath(currentPath);
    setHistory([currentPath]);
    setHistoryIndex(0);
    setAddressInput(addressTextFor(currentPath));
    setSelectedItem(null);
    setSearchOpen(initialSearchOpen);
    setSearchQuery('');
    setAppleSearchQuery('');
    if (isPicturesFolderPath(currentPath)) {
      setViewMode('thumbnails');
    }
  }, [currentPath, initialSearchOpen]);

  useEffect(() => {
    setAddressInput(addressTextFor(path));
    if (isPicturesFolderPath(path)) {
      setViewMode('thumbnails');
    }
  }, [path]);

  const items = useMemo(() => getItemsFromPath(path), [path]);
  const visibleItems = useMemo(() => {
    const needle = searchQuery.trim().toLocaleLowerCase();
    return needle ? items.filter(item => item.name.toLocaleLowerCase().includes(needle)) : items;
  }, [items, searchQuery]);
  const selectedFile = useMemo(
    () => items.find((item) => item.name === selectedItem) ?? null,
    [items, selectedItem]
  );

  const appleVisibleItems = useMemo(() => {
    const needle = appleSearchQuery.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => item.name.toLowerCase().includes(needle));
  }, [appleSearchQuery, items]);

  useEffect(() => {
    if (theme !== 'macos-26') return;

    const handleFinderSidebarSize = (event: Event) => {
      const customEvent = event as CustomEvent<'small' | 'medium' | 'large'>;
      if (
        customEvent.detail === 'small' ||
        customEvent.detail === 'medium' ||
        customEvent.detail === 'large'
      ) {
        setFinderSidebarSize(customEvent.detail);
      }
    };

    window.addEventListener('macos-finder-sidebar-size-changed', handleFinderSidebarSize);
    return () => window.removeEventListener('macos-finder-sidebar-size-changed', handleFinderSidebarSize);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'macos-26') return;

    const handleFinderBarToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ windowId?: string; bar?: 'path' | 'status' }>;
      const expectedWindowId = `explorer:${currentPath}`;
      if (customEvent.detail?.windowId !== expectedWindowId) return;

      if (customEvent.detail.bar === 'path') {
        setShowApplePathBar((current) => {
          const next = !current;
          localStorage.setItem('macos-finder-path-bar', String(next));
          window.dispatchEvent(new CustomEvent('webos:finder-bar-state', {
            detail: { pathBar: next },
          }));
          return next;
        });
      }

      if (customEvent.detail.bar === 'status') {
        setShowAppleStatusBar((current) => {
          const next = !current;
          localStorage.setItem('macos-finder-status-bar', String(next));
          window.dispatchEvent(new CustomEvent('webos:finder-bar-state', {
            detail: { statusBar: next },
          }));
          return next;
        });
      }
    };

    window.addEventListener('webos:finder-bar-toggle', handleFinderBarToggle);
    return () => window.removeEventListener('webos:finder-bar-toggle', handleFinderBarToggle);
  }, [currentPath, theme]);

  useEffect(() => {
    if (theme !== 'macos-26') return;

    const handleFinderViewCommand = (event: Event) => {
      const customEvent = event as CustomEvent<{ windowId?: string; mode?: 'icons' | 'list' }>;
      const expectedWindowId = `explorer:${currentPath}`;
      if (customEvent.detail?.windowId !== expectedWindowId) return;
      if (customEvent.detail.mode === 'icons' || customEvent.detail.mode === 'list') {
        setViewMode(customEvent.detail.mode);
      }
    };

    window.addEventListener('webos:finder-view', handleFinderViewCommand);
    return () => window.removeEventListener('webos:finder-view', handleFinderViewCommand);
  }, [currentPath, theme]);

  useEffect(() => {
    if (theme !== 'macos-26') {
      setQuickLookOpen(false);
      return;
    }

    const handleQuickLookKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        Boolean(target?.isContentEditable);
      if (isTypingTarget) return;

      if (event.code === 'Space' && selectedFile?.type === 'file') {
        event.preventDefault();
        setQuickLookOpen((value) => !value);
      } else if (event.key === 'Escape') {
        setQuickLookOpen(false);
      }
    };

    window.addEventListener('keydown', handleQuickLookKey);
    return () => window.removeEventListener('keydown', handleQuickLookKey);
  }, [selectedFile, theme]);

  const navigateToPath = useCallback(
    (targetPath: string, recordHistory: boolean = true) => {
      const normalized = targetPath.replace('Local Disk (C:)', 'C:').replace(/^C:$/i, 'C:\\');
      setPath(normalized);
      setSearchQuery('');
      setSelectedItem(null);

      if (recordHistory) {
        const currentHistory = history.slice(0, historyIndex + 1);
        const newHistory = currentHistory[currentHistory.length - 1] === normalized ? currentHistory : [...currentHistory, normalized];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    },
    [history, historyIndex]
  );

  const handleNavigate = (item: FileSystemItem) => {
    if (item.type === 'folder' || item.type === 'drive') {
      let newPath = path;
      if (item.name === 'Local Disk (C:)') newPath = 'C:';
      else if (path === 'My Computer') newPath = item.name === 'Local Disk (C:)' ? 'C:' : item.name;
      else if (path.endsWith('\\') || path.endsWith(':')) newPath += (path.endsWith(':') ? '\\' : '') + item.name;
      else newPath += '\\' + item.name;

      newPath = newPath.replace('Local Disk (C:)', 'C:').replace(/^C:$/i, 'C:\\');
      navigateToPath(newPath);
    } else if (item.type === 'file') {
      if (onOpenItem) {
        onOpenItem(item, path);
      }
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPath(history[historyIndex - 1]);
      setSelectedItem(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPath(history[historyIndex + 1]);
      setSelectedItem(null);
    }
  };

  const handleUp = () => {
    if (path === 'My Computer') return;
    const parts = path.split('\\').filter(Boolean);
    parts.pop();
    const parent = parts.join('\\') || 'My Computer';
    navigateToPath(parent === 'C:' ? 'C:\\' : parent);
  };

  const resolveNodeByPath = (target: string): FileSystemItem | null =>
    getFileSystemItemFromPath(target);

  const pathExists = (target: string) => {
    if (target === 'My Computer') return true;
    const normalized = target.replace(/\//g, '\\').replace(/^C:$/i, 'C:\\');
    return Boolean(resolveNodeByPath(normalized));
  };

  const handleAddressSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const target = addressInput.trim();
    if (!target) return;

    if (!pathExists(target)) {
      console.warn(`Path "${target}" not found in virtual file system`);
      setAddressInput(path);
      return;
    }

    const normalized = target.replace(/\//g, '\\').replace(/^C:$/i, 'C:\\');
    const node = resolveNodeByPath(normalized);

    if (!node) {
      setAddressInput(path);
      return;
    }

    if (node.type === 'file') {
      const parts = normalized.split('\\');
      const fileName = parts.pop();
      const parentPath = parts.join('\\') || 'My Computer';
      if (fileName && onOpenItem) {
        const parentItems = getItemsFromPath(parentPath);
        const fileItem = parentItems.find(
          (item) => item.name.toLocaleLowerCase() === fileName.toLocaleLowerCase()
        );
        if (fileItem) {
          onOpenItem(fileItem, parentPath);
        }
      }
      return;
    }

    navigateToPath(normalized);
  };

  const detailsForSelection = useMemo(() => {
    if (!selectedItem) return null;
    const item = items.find(i => i.name === selectedItem);
    if (!item) return null;
    const getTypeLabel = () => {
      switch (item.type) {
        case 'folder':
          return isRu ? 'Папка с файлами' : 'File Folder';
        case 'drive':
          return isRu ? 'Диск' : 'Drive';
        case 'file':
          return isRu ? 'Файл' : 'File';
        default:
          return isRu ? 'Элемент' : 'Item';
      }
    };
    return {
      name: item.name,
      type: getTypeLabel(),
      size: item.size || '',
    };
  }, [items, selectedItem, isRu]);

  const menuItems = isRu
    ? ['Файл', 'Правка', 'Вид', 'Избранное', 'Сервис', 'Справка']
    : ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'];
  // Menu bar colours per OS: classic grey with navy selection on Win98 and Win2000,
  // Luna beige with blue selection on XP.
  const menuBarClass = theme === 'win-98' ? 'bg-[#c0c0c0]' : theme === 'win2000' ? 'bg-[#d4d0c8]' : 'bg-[#ece9d8]';
  const menuItemHoverClass = theme === 'win-98' ? 'hover:bg-[#000080]' : theme === 'win2000' ? 'hover:bg-[#0a246a]' : 'hover:bg-[#316ac5]';

  const getExplorerItemIcon = (item: FileSystemItem): string => {
    if (theme === 'win-98' || theme === 'win2000') {
      if (item.type === 'drive') return win98DriveIcon;
      if (item.type === 'folder') return win98FolderIcon;
    }
    return resolveFileIcon(item, theme);
  };

  const getAddressIcon = () => {
    if (theme === 'win-98') return path === 'My Computer' ? win98ComputerIcon : win98FolderIcon;
    if (theme === 'win2000') return path === 'My Computer' ? win2000ComputerIcon : win98FolderIcon;
    return path === 'My Computer' ? computerIcon : folderIcon;
  };

  const getTreeItemPath = (parentPath: string, item: FileSystemItem) => {
    if (parentPath === 'My Computer' && item.type === 'drive') return 'C:\\';
    if (parentPath === 'My Computer') return item.name;
    const basePath = parentPath.endsWith('\\') ? parentPath.slice(0, -1) : parentPath;
    return basePath + '\\' + item.name;
  };

  const renderFolderTree = (node: FileSystemItem, nodePath: string, depth: number): React.ReactNode => {
    // Windows 98 and 2000 place network entries beside My Computer on the desktop, not under it.
    // The path itself stays valid, so Start menu and Control Panel links still resolve.
    const children = Object.values(node.children ?? {}).filter(child =>
      (child.type === 'folder' || child.type === 'drive')
      && !((theme === 'win-98' || theme === 'win2000') && nodePath === 'My Computer' && child.name === 'Network Neighborhood'));
    const expanded = Boolean(expandedTreePaths[nodePath]);
    const current = path.toLocaleLowerCase() === nodePath.toLocaleLowerCase();
    return (
      <div key={node.id} className="min-w-0">
        <div className="flex min-w-0 items-center" style={{ paddingLeft: depth * 12 }}>
          {children.length > 0 ? (
            <button type="button" onClick={() => setExpandedTreePaths(prev => ({ ...prev, [nodePath]: !prev[nodePath] }))} aria-label={expanded ? (isRu ? 'Свернуть' : 'Collapse') : (isRu ? 'Развернуть' : 'Expand')} className="w-5 h-6 shrink-0 border-0 bg-transparent flex items-center justify-center">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
          ) : <span className="w-5 shrink-0" />}
          <button type="button" onClick={() => navigateToPath(nodePath)} title={node.name} className={`flex min-w-0 flex-1 items-center gap-1 rounded-sm px-1 py-1 text-left ${current ? 'font-semibold bg-blue-600/15' : 'hover:bg-black/5'}`}>
            <img src={getExplorerItemIcon(node)} alt="" className="h-4 w-4 shrink-0 object-contain" />
            <span className="truncate">{node.name}</span>
          </button>
        </div>
        {expanded && children.length > 0 && <div>{children.map(child => renderFolderTree(child, getTreeItemPath(nodePath, child), depth + 1))}</div>}
      </div>
    );
  };

  const getAppleItemIcon = (item: FileSystemItem) => {
    if (item.appId) return resolveFileIcon(item, theme);
    if (item.type === 'drive') return appleDriveIcon;
    if (item.type === 'folder') return appleFolderIcon;
    if (/\.(png|jpe?g|gif|webp)$/i.test(item.name)) return appleImageIcon;
    return appleDocumentIcon;
  };

  if (isAppleExplorer) {
    const appleListView = viewMode === 'list' || viewMode === 'details';

    return (
      <div
        className="apple-file-browser"
        data-sidebar-size={theme === 'macos-26' ? finderSidebarSize : undefined}
      >
        <header className="apple-file-browser__toolbar">
          <div className="apple-file-browser__nav">
            <button type="button" onClick={handleBack} disabled={historyIndex === 0} aria-label="Back">
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={handleForward}
              disabled={historyIndex >= history.length - 1}
              aria-label="Forward"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="apple-file-browser__location">
            <input
              value={addressInput}
              onChange={(event) => setAddressInput(event.target.value)}
              onKeyDown={handleAddressSubmit}
              aria-label={isRu ? 'Путь' : 'Location'}
            />
          </div>

          <div className="apple-file-browser__tools">
            <button
              type="button"
              className={!appleListView ? 'is-active' : ''}
              onClick={() => setViewMode('icons')}
              aria-label="Grid view"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              className={appleListView ? 'is-active' : ''}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List size={15} />
            </button>
            {theme === 'macos-26' && (
              <button
                type="button"
                disabled={selectedFile?.type !== 'file'}
                onClick={() => setQuickLookOpen(true)}
                aria-label={isRu ? 'Быстрый просмотр' : 'Quick Look'}
                title={isRu ? 'Быстрый просмотр (Пробел)' : 'Quick Look (Space)'}
              >
                <Eye size={15} />
              </button>
            )}
          </div>
        </header>

        <div className="apple-file-browser__body">
          {!isIosExplorer && (
            <aside className="apple-file-browser__sidebar">
              <small>{isRu ? 'Избранное' : 'Favorites'}</small>
              <button
                type="button"
                className={path === 'C:\\Documents and Settings\\C4m1r\\Desktop' ? 'is-active' : ''}
                onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\Desktop')}
              >
                <img src={appleFolderIcon} alt="" />
                <span>{isRu ? 'Рабочий стол' : 'Desktop'}</span>
              </button>
              <button
                type="button"
                className={path === 'C:\\Documents and Settings\\C4m1r\\My Documents' ? 'is-active' : ''}
                onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\My Documents')}
              >
                <img src={appleFolderIcon} alt="" />
                <span>{isRu ? 'Документы' : 'Documents'}</span>
              </button>
              <button
                type="button"
                className={path === 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Projects' ? 'is-active' : ''}
                onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\My Documents\\My Projects')}
              >
                <img src={appleFolderIcon} alt="" />
                <span>{isRu ? 'Проекты' : 'Projects'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('app:launch', { detail: { appId: 'blog' } }))}
              >
                <img src={appleDocumentIcon} alt="" />
                <span>{isRu ? 'Блог' : 'Blog'}</span>
              </button>
              <button type="button" className={path.endsWith('My Pictures') ? 'is-active' : ''} onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\My Documents\\My Pictures')}>
                <img src={appleFolderIcon} alt="" />
                <span>{isRu ? 'Мои рисунки' : 'Pictures'}</span>
              </button>
              <button type="button" className={path.endsWith('My Music') ? 'is-active' : ''} onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\My Documents\\My Music')}>
                <img src={appleFolderIcon} alt="" />
                <span>{isRu ? 'Моя музыка' : 'Music'}</span>
              </button>
              <button type="button" className={path.endsWith('My Videos') ? 'is-active' : ''} onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\My Documents\\My Videos')}>
                <img src={appleFolderIcon} alt="" />
                <span>{isRu ? 'Мои видеозаписи' : 'Videos'}</span>
              </button>
              <button type="button" className={path.endsWith('My Downloads') ? 'is-active' : ''} onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\My Documents\\My Downloads')}>
                <img src={appleFolderIcon} alt="" />
                <span>{isRu ? 'Загрузки' : 'Downloads'}</span>
              </button>

              <small>{isRu ? 'Расположения' : 'Locations'}</small>
              <button
                type="button"
                className={path === 'My Computer' || path === 'C:' ? 'is-active' : ''}
                onClick={() => navigateToPath('My Computer')}
              >
                <img src={appleDriveIcon} alt="" />
                <span>Macintosh HD</span>
              </button>
              <button
                type="button"
                className={path === 'C:\\Program Files' ? 'is-active' : ''}
                onClick={() => navigateToPath('C:\\Program Files')}
              >
                <img src={appleFolderIcon} alt="" />
                <span>{isRu ? 'Приложения' : 'Applications'}</span>
              </button>
            </aside>
          )}

          <main className="apple-file-browser__content">
            <div className="apple-file-browser__content-head">
              <div>
                <small>{isIosExplorer ? (isRu ? 'Файлы' : 'Files') : 'Finder'}</small>
                <strong>{path === 'My Computer' ? (isIosExplorer ? (isRu ? 'Обзор' : 'Browse') : 'Macintosh HD') : path.split('\\').filter(Boolean).pop() || path}</strong>
              </div>
              <label className="apple-file-browser__search">
                <Search size={13} />
                <input
                  value={appleSearchQuery}
                  onChange={(event) => setAppleSearchQuery(event.target.value)}
                  placeholder={isRu ? 'Поиск' : 'Search'}
                  aria-label={isRu ? 'Поиск' : 'Search'}
                />
                {appleSearchQuery && (
                  <button
                    type="button"
                    className="apple-file-browser__search-clear"
                    onClick={() => setAppleSearchQuery('')}
                    aria-label={isRu ? 'Очистить поиск' : 'Clear search'}
                  >
                    ×
                  </button>
                )}
              </label>
            </div>

            {appleListView ? (
              <div className="apple-file-browser__list">
                {appleVisibleItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={selectedItem === item.name ? 'is-selected' : ''}
                    onClick={() => {
                      setSelectedItem(item.name);
                      if (isIosExplorer) handleNavigate(item);
                    }}
                    onDoubleClick={() => {
                      if (!isIosExplorer) handleNavigate(item);
                    }}
                  >
                    <img src={getAppleItemIcon(item)} alt="" />
                    <span>{item.name}</span>
                    <small>{item.size || (item.type === 'folder' ? (isRu ? 'Папка' : 'Folder') : '')}</small>
                  </button>
                ))}
              </div>
            ) : (
              <div className="apple-file-browser__grid">
                {appleVisibleItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={selectedItem === item.name ? 'is-selected' : ''}
                    onClick={() => {
                      setSelectedItem(item.name);
                      if (isIosExplorer) handleNavigate(item);
                    }}
                    onDoubleClick={() => {
                      if (!isIosExplorer) handleNavigate(item);
                    }}
                  >
                    <span className="apple-file-browser__item-icon">
                      <img src={getAppleItemIcon(item)} alt="" />
                    </span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>

        {theme === 'macos-26' && showApplePathBar && (
          <nav className="apple-file-browser__pathbar" aria-label="Finder path">
            <button type="button" onClick={() => navigateToPath('My Computer')}>
              Macintosh HD
            </button>
            {path !== 'My Computer' && path.split('\\').filter(Boolean).map((segment, index, segments) => {
              if (index === 0 && segment === 'C:') return null;
              const fullPath = segments.slice(0, index + 1).join('\\');
              return (
                <span key={fullPath}>
                  <i aria-hidden="true">›</i>
                  <button type="button" onClick={() => navigateToPath(fullPath)}>
                    {segment}
                  </button>
                </span>
              );
            })}
          </nav>
        )}

        {theme === 'macos-26' && quickLookOpen && selectedFile?.type === 'file' && (
          <div className="apple-quick-look" role="dialog" aria-label={`Quick Look: ${selectedFile.name}`}>
            <button
              type="button"
              className="apple-quick-look__backdrop"
              aria-label="Close Quick Look"
              onClick={() => setQuickLookOpen(false)}
            />
            <section className="apple-quick-look__panel" onClick={(event) => event.stopPropagation()}>
              <header>
                <div>
                  <strong>{selectedFile.name}</strong>
                  <small>Quick Look</small>
                </div>
                <button type="button" onClick={() => setQuickLookOpen(false)} aria-label="Close Quick Look">
                  ×
                </button>
              </header>

              <div className="apple-quick-look__content">
                {/\.(png|jpe?g|gif|webp)$/i.test(selectedFile.name) && selectedFile.content ? (
                  <img src={selectedFile.content} alt={selectedFile.name} />
                ) : selectedFile.content ? (
                  <pre>{selectedFile.content}</pre>
                ) : (
                  <div className="apple-quick-look__empty">
                    <img src={getAppleItemIcon(selectedFile)} alt="" />
                    <strong>{selectedFile.name}</strong>
                    <span>{selectedFile.size || (isRu ? 'Предпросмотр недоступен' : 'Preview unavailable')}</span>
                  </div>
                )}
              </div>

              <footer>
                <span>{selectedFile.size || (isRu ? 'Файл' : 'File')}</span>
                <span>{isRu ? 'Пробел закрывает просмотр' : 'Press Space to close'}</span>
              </footer>
            </section>
          </div>
        )}

        {showAppleStatusBar && (
          <footer className="apple-file-browser__status">
            <span>{appleVisibleItems.length} {isRu ? 'объектов' : 'items'}{appleSearchQuery ? ` · ${isRu ? 'поиск' : 'search'}` : ''}</span>
            {selectedItem && <span>{selectedItem}</span>}
          </footer>
        )}
      </div>
    );
  }

  // Drives and system items in one flat grid for the classic (98, 2000) My Computer; Large and Small Icons share it.
  const classicSystemEntries = path !== 'My Computer' || !isClassicWindows ? [] : theme === 'win2000' ? [
                  { key: '3½ Floppy (A:)', label: isRu ? 'Дисковод 3½ (A:)' : '3½ Floppy (A:)', icon: win2000FloppyIcon, open: undefined as (() => void) | undefined },
                  ...visibleItems.filter((i) => i.name === 'Local Disk (C:)').map((item) => ({ key: item.name, label: isRu ? 'Локальный диск (C:)' : item.name, icon: win2000DriveIcon, open: () => handleNavigate(item) })),
                  { key: 'CD-ROM (D:)', label: isRu ? 'Дисковод CD-ROM (D:)' : 'CD-ROM Drive (D:)', icon: win2000CdIcon, open: undefined },
                  { key: 'Control Panel', label: isRu ? 'Панель управления' : 'Control Panel', icon: win2000ControlPanelIcon, open: () => window.dispatchEvent(new CustomEvent('app:launch', { detail: { appId: 'control-panel' } })) },
                  { key: 'Printers', label: isRu ? 'Принтеры' : 'Printers', icon: win2000PrintersIcon, open: undefined },
                  { key: 'Scheduled Tasks', label: isRu ? 'Запланированные задания' : 'Scheduled Tasks', icon: win2000ScheduledTasksIcon, open: undefined },
                  { key: 'Web Folders', label: isRu ? 'Веб-папки' : 'Web Folders', icon: win2000WebFoldersIcon, open: undefined },
                ] : [
                  { key: '3½ Floppy (A:)', label: isRu ? 'Дисковод 3½ (A:)' : '3½ Floppy (A:)', icon: win98FloppyIcon, open: undefined as (() => void) | undefined },
                  ...visibleItems.filter((i) => i.name === 'Local Disk (C:)').map((item) => ({ key: item.name, label: isRu ? 'Локальный диск (C:)' : item.name, icon: win98DriveIcon, open: () => handleNavigate(item) })),
                  { key: 'CD-ROM (D:)', label: isRu ? 'Дисковод CD-ROM (D:)' : 'CD-ROM Drive (D:)', icon: win98CdIcon, open: undefined },
                  { key: 'Control Panel', label: isRu ? 'Панель управления' : 'Control Panel', icon: win98ControlPanelIcon, open: () => window.dispatchEvent(new CustomEvent('app:launch', { detail: { appId: 'control-panel' } })) },
                  { key: 'Printers', label: isRu ? 'Принтеры' : 'Printers', icon: win98PrintersIcon, open: undefined },
                  { key: 'Dial-Up Networking', label: isRu ? 'Удалённый доступ' : 'Dial-Up Networking', icon: win98DialupIcon, open: undefined },
                  { key: 'Scheduled Tasks', label: isRu ? 'Запланированные задания' : 'Scheduled Tasks', icon: win98SchedTasksIcon, open: undefined },
                  { key: 'Web Folders', label: isRu ? 'Веб-папки' : 'Web Folders', icon: win98WebFoldersIcon, open: undefined },
                ];

  return (
    <div data-os-theme={theme} className={`file-explorer flex flex-col h-full min-h-0 bg-white font-tahoma text-xs select-none file-explorer--${theme}`}>
      {/* Toolbar */}
      <div className="flex flex-col border-b border-[#aca899]">
        {/* Menu Bar */}
        <div className={`fx-menubar flex items-center px-1 ${menuBarClass} border-b border-[#aca899]`}>
          {menuItems.map((item) => (
            <button
              key={item}
              className={`px-2 py-0.5 ${menuItemHoverClass} hover:text-white transition-colors cursor-default text-black bg-transparent border-0`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Standard Action Buttons */}
        <div className="fx-toolbar flex items-center p-1 bg-[#ece9d8] gap-1 border-b border-[#aca899]">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/60 active:bg-gray-200 disabled:opacity-40 text-black border-0 bg-transparent"
          >
            {isClassicWindows ? <ChevronLeft size={16} /> : <img src={backIcon} alt="" className="w-5 h-5 object-contain" />}
            <span>{isRu ? 'Назад' : 'Back'}</span>
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/60 active:bg-gray-200 disabled:opacity-40 text-black border-0 bg-transparent"
          >
            {isClassicWindows ? <ChevronRight size={16} /> : <img src={forwardIcon} alt="" className="w-5 h-5 object-contain" />}
            <span>{isRu ? 'Вперед' : 'Forward'}</span>
          </button>
          <button
            onClick={handleUp}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/60 active:bg-gray-200 text-black border-0 bg-transparent"
          >
            {isClassicWindows ? <ChevronUp size={16} /> : <img src={upIcon} alt="" className="w-5 h-5 object-contain" />}
            <span>{isRu ? 'Вверх' : 'Up'}</span>
          </button>
          <div className="w-px h-6 bg-gray-400 mx-1" />
          <button onClick={() => { setSearchOpen(value => !value); setSearchQuery(''); }} aria-pressed={searchOpen} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/60 text-black border-0 bg-transparent">
            {isClassicWindows ? <img src={win98SearchIcon} alt="" className="w-4 h-4 object-contain" /> : <img src={searchIconXp} alt="" className="w-4 h-4 object-contain" />}
            <span>{isRu ? 'Поиск' : 'Search'}</span>
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded border border-transparent hover:bg-white/60 text-black ${showSidebar ? 'bg-white/60 border-gray-400' : 'bg-transparent'}`}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {isClassicWindows ? <span aria-hidden="true">▣</span> : <img src={foldersToggleIcon} alt="" className="w-4 h-4 object-contain" />}
            <span>{isRu ? 'Папки' : 'Folders'}</span>
          </button>
          {theme === 'win2000' && (
            <>
              <button type="button" className="flex items-center gap-1 px-2 py-1 text-black border-0 bg-transparent">
                <img src={win98SearchIcon} alt="" className="w-4 h-4 object-contain" style={{ filter: 'grayscale(1)', opacity: 0.55 }} />
                <span>{isRu ? 'Журнал' : 'History'}</span>
              </button>
              <div className="w-px h-6 bg-gray-400 mx-1" />
              {[isRu ? 'Переместить' : 'Move To', isRu ? 'Копировать' : 'Copy To', isRu ? 'Удалить' : 'Delete', isRu ? 'Отменить' : 'Undo'].map((label) => (
                <button key={label} type="button" disabled className="flex items-center gap-1 px-2 py-1 text-black border-0 bg-transparent disabled:opacity-40">
                  <span aria-hidden="true" className="fx-glyph" />
                  <span>{label}</span>
                </button>
              ))}
            </>
          )}
          <div className="w-px h-6 bg-gray-400 mx-1" />
          <div className="relative" ref={viewsMenuRef}>
            <button
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/60 text-black border-0 bg-transparent"
              aria-haspopup={viewsMenu ? 'menu' : undefined}
              aria-expanded={viewsMenu ? viewsMenuOpen : undefined}
              onClick={() => {
                if (viewsMenu) {
                  setViewsMenuOpen((open) => !open);
                  return;
                }
                setViewMode(nextCycledViewMode(viewMode));
              }}
            >
              {viewsMenu ? <Grid size={15} /> : <img src={viewThumbnailIcon} alt="" className="w-4 h-4 object-contain" />}
              <span>{isRu ? 'Виды' : 'Views'}</span>
            </button>
            {viewsMenu && viewsMenuOpen && (
              <div role="menu" className="absolute left-0 top-full z-50 min-w-[140px] border border-[#808080] bg-[#c0c0c0] py-0.5 text-xs text-black shadow-[2px_2px_0_#404040]">
                {viewsMenu.map((entry) => (
                  <button
                    key={entry.mode}
                    role="menuitemradio"
                    aria-checked={viewMode === entry.mode}
                    type="button"
                    onClick={() => { setViewMode(entry.mode); setViewsMenuOpen(false); }}
                    className={`block w-full px-4 py-0.5 text-left ${viewMode === entry.mode ? 'font-bold' : ''} hover:bg-[#000080] hover:text-white bg-transparent border-0`}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Address Bar */}
        <div className="fx-address flex items-center p-1 bg-[#ece9d8] gap-2">
          <span className="text-gray-600 font-semibold">{isRu ? 'Адрес' : 'Address'}</span>
          <div className="flex-1 bg-white border border-[#7f9db9] flex items-center px-1 h-5 shadow-inner">
            <img src={getAddressIcon()} className="w-4 h-4 mr-1.5 object-contain" alt="" />
            <input
              type="text"
              value={addressInput}
              onChange={(event) => setAddressInput(event.target.value)}
              onKeyDown={handleAddressSubmit}
              className="w-full outline-none text-xs text-black bg-transparent border-0"
            />
          </div>
          <button
            className="flex items-center gap-1 px-2 py-0.5 bg-[#ece9d8] border border-gray-400 rounded hover:bg-white text-black cursor-pointer"
            onClick={() => {
              const fakeEvent = { key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>;
              handleAddressSubmit(fakeEvent);
            }}
          >
            <img src={goIcon} alt="" className="w-3.5 h-3.5 object-contain" />
            <span>{isRu ? 'Переход' : 'Go'}</span>
          </button>
        </div>
      </div>
      {searchOpen && (
        <div className="flex items-center gap-2 px-2 py-1 border-b border-[#aca899] bg-white">
          <Search size={14} aria-hidden="true" />
          <input autoFocus value={searchQuery} onChange={event => setSearchQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') { setSearchQuery(''); setSearchOpen(false); } }} placeholder={isRu ? 'Найти в текущей папке…' : 'Search this folder…'} aria-label={isRu ? 'Поиск в текущей папке' : 'Search this folder'} className="min-w-0 flex-1 bg-transparent outline-none text-xs text-black" />
          <span className="text-[10px] text-gray-500">{visibleItems.length}/{items.length}</span>
          <button type="button" onClick={() => { setSearchQuery(''); setSearchOpen(false); }} className="border-0 bg-transparent text-xs">{isRu ? 'Закрыть' : 'Close'}</button>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex overflow-hidden h-0">
        {/* Sidebar Task Pane */}
        {isWindowsXp && showSidebar && (
          <div
            className="w-48 bg-[#7ba2e7] overflow-y-auto p-3 flex flex-col gap-3 flex-shrink-0"
            style={{ background: 'linear-gradient(to bottom, #7ba2e7 0%, #6375d6 100%)' }}
          >
            {/* Picture Tasks Panel */}
            {isMyPictures && (
              <div className="rounded overflow-hidden">
                <div
                  className="bg-gradient-to-r from-white to-[#c6d3f7] px-3 py-1 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleGroup('pictureTasks')}
                >
                  <span className="font-bold text-[#215dc6]">
                    {isRu ? 'Задачи для изображений' : 'Picture Tasks'}
                  </span>
                  {expandedGroups.pictureTasks ? <ChevronUp size={14} className="text-[#215dc6]" /> : <ChevronDown size={14} className="text-[#215dc6]" />}
                </div>
                {expandedGroups.pictureTasks && (
                  <div className="bg-[#d6dff7] p-2 flex flex-col gap-1.5 border-x border-b border-white/50 text-[11px]">
                    <button
                      onClick={() => {
                        const pictureItems = visibleItems.filter(i => /\.(png|jpe?g|gif|webp)$/i.test(i.name) && typeof i.content === 'string');
                        if (pictureItems.length > 0) {
                          if (onOpenSlideshow) onOpenSlideshow(pictureItems, path);
                          else onOpenItem?.(pictureItems[0], path);
                        }
                      }}
                      className="text-left hover:underline text-[#215dc6] flex items-center gap-1.5 bg-transparent border-0 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 bg-[#215dc6] rounded-full" />
                      <span>{isRu ? 'Просмотр в виде слайд-шоу' : 'View as a slide show'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="text-left hover:underline text-[#215dc6] flex items-center gap-1.5 bg-transparent border-0 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 bg-[#215dc6] rounded-full" />
                      <span>{isRu ? 'Печать изображений' : 'Print pictures'}</span>
                    </button>
                    <button disabled className="text-left text-gray-500 opacity-60 flex items-center gap-1.5 bg-transparent border-0">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <span>{isRu ? 'Копировать на CD' : 'Copy all items to CD'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* File and Folder Tasks */}
            <div className="rounded overflow-hidden">
              <div
                className="bg-gradient-to-r from-white to-[#c6d3f7] px-3 py-1 flex justify-between items-center cursor-pointer"
                onClick={() => toggleGroup('tasks')}
              >
                <span className="font-bold text-[#215dc6]">
                  {isRu ? 'Задачи для файлов и папок' : 'File and Folder Tasks'}
                </span>
                {expandedGroups.tasks ? <ChevronUp size={14} className="text-[#215dc6]" /> : <ChevronDown size={14} className="text-[#215dc6]" />}
              </div>
              {expandedGroups.tasks && (
                <div className="bg-[#d6dff7] p-2 flex flex-col gap-1.5 border-x border-b border-white/50 text-[11px]">
                  <button className="text-left hover:underline text-[#215dc6] flex items-center gap-1.5 bg-transparent border-0 cursor-pointer">
                    <span className="w-1.5 h-1.5 bg-[#215dc6] rounded-full" />
                    <span>{isRu ? 'Создать новую папку' : 'Make a new folder'}</span>
                  </button>
                  <button className="text-left hover:underline text-[#215dc6] flex items-center gap-1.5 bg-transparent border-0 cursor-pointer">
                    <span className="w-1.5 h-1.5 bg-[#215dc6] rounded-full" />
                    <span>{isRu ? 'Открыть общий доступ' : 'Share this folder'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Other Places */}
            <div className="rounded overflow-hidden">
              <div
                className="bg-gradient-to-r from-white to-[#c6d3f7] px-3 py-1 flex justify-between items-center cursor-pointer"
                onClick={() => toggleGroup('places')}
              >
                <span className="font-bold text-[#215dc6]">
                  {isRu ? 'Другие места' : 'Other Places'}
                </span>
                {expandedGroups.places ? <ChevronUp size={14} className="text-[#215dc6]" /> : <ChevronDown size={14} className="text-[#215dc6]" />}
              </div>
              {expandedGroups.places && (
                <div className="bg-[#d6dff7] p-2 flex flex-col gap-1.5 border-x border-b border-white/50 text-[11px]">
                  <button onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\Desktop')} className="text-left hover:underline text-[#215dc6] flex items-center gap-1.5 bg-transparent border-0 cursor-pointer">
                    <img src={folderIcon} className="w-4 h-4 object-contain" alt="" />
                    <span>{isRu ? 'Рабочий стол' : 'Desktop'}</span>
                  </button>
                  <button onClick={() => navigateToPath('My Computer')} className="text-left hover:underline text-[#215dc6] flex items-center gap-1.5 bg-transparent border-0 cursor-pointer">
                    <img src={computerIcon} className="w-4 h-4 object-contain" alt="" />
                    <span>{isRu ? 'Мой компьютер' : 'My Computer'}</span>
                  </button>
                  <button onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\My Documents')} className="text-left hover:underline text-[#215dc6] flex items-center gap-1.5 bg-transparent border-0 cursor-pointer">
                    <img src={folderIcon} className="w-4 h-4 object-contain" alt="" />
                    <span>{isRu ? 'Мои документы' : 'My Documents'}</span>
                  </button>
                  <button onClick={() => navigateToPath('C:\\Documents and Settings\\C4m1r\\My Documents\\My Pictures')} className="text-left hover:underline text-[#215dc6] flex items-center gap-1.5 bg-transparent border-0 cursor-pointer">
                    <img src={folderIcon} className="w-4 h-4 object-contain" alt="" />
                    <span>{isRu ? 'Мои рисунки' : 'My Pictures'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Details Panel */}
            <div className="rounded overflow-hidden">
              <div
                className="bg-gradient-to-r from-white to-[#c6d3f7] px-3 py-1 flex justify-between items-center cursor-pointer"
                onClick={() => toggleGroup('details')}
              >
                <span className="font-bold text-[#215dc6]">
                  {isRu ? 'Подробности' : 'Details'}
                </span>
                {expandedGroups.details ? <ChevronUp size={14} className="text-[#215dc6]" /> : <ChevronDown size={14} className="text-[#215dc6]" />}
              </div>
              {expandedGroups.details && (
                <div className="bg-[#d6dff7] p-2 flex flex-col gap-1 border-x border-b border-white/50 text-[#215dc6] text-[11px]">
                  <div className="font-bold">{path === 'My Computer' ? (isRu ? 'Мой компьютер' : 'My Computer') : addressTextFor(path).split('\\').pop()}</div>
                  <div>{isRu ? 'Системная папка' : 'System Folder'}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {!isWindowsXp && showSidebar && (
          <aside className="w-52 max-w-[42%] shrink-0 overflow-auto border-r border-black/10 p-2 text-xs" aria-label={isRu ? 'Дерево папок' : 'Folder tree'}>
            <div className="mb-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide opacity-60">{isRu ? 'Папки' : 'Folders'}</div>
            {renderFolderTree(initialFileSystem['My Computer'], 'My Computer', 0)}
          </aside>
        )}

        {/* Windows 2000 web-view pane: folder title banner and the description of the selected item. */}
        {theme === 'win2000' && !showSidebar && (() => {
          const folderTitle = path === 'My Computer'
            ? (isRu ? 'Мой компьютер' : 'My Computer')
            : addressTextFor(path).split('\\').filter(Boolean).pop() ?? path;
          const kindOf = (name: string) => /^Local Disk/i.test(name) ? (isRu ? 'Локальный диск' : 'Local Disk')
            : /^3½|Floppy/i.test(name) ? (isRu ? 'Дисковод 3½' : '3½-Inch Floppy Disk')
            : /^CD/i.test(name) ? (isRu ? 'Компакт-диск' : 'Compact Disc')
            : (isRu ? 'Системная папка' : 'System Folder');
          return (
            <aside className="fx-webview" aria-label={folderTitle}>
              <div className="fx-webview__banner">
                <img src={getAddressIcon()} alt="" width={64} height={64} style={{ imageRendering: 'pixelated' }} />
                <span className="fx-webview__title">{folderTitle}</span>
              </div>
              <div className="fx-webview__body">
                {selectedItem ? (
                  <>
                    <b>{selectedItem}</b>
                    <div>{path === 'My Computer' ? kindOf(selectedItem) : ''}</div>
                  </>
                ) : (
                  <p>{isRu ? 'Выберите элемент, чтобы увидеть его описание.' : 'Select an item to view its description.'}</p>
                )}
              </div>
            </aside>
          );
        })()}

        {/* Content Pane */}
        <div className="min-w-0 flex-1 bg-white p-4 overflow-y-auto" onClick={() => setSelectedItem(null)}>
          {viewMode === 'thumbnails' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {visibleItems.map((item, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center group cursor-pointer p-2 border ${
                    selectedItem === item.name
                      ? 'border-[#316ac5] bg-[#316ac5]/10'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item.name);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(item);
                  }}
                >
                  <div className="w-24 h-20 bg-white border border-gray-300 shadow-sm flex items-center justify-center p-1 mb-2">
                    <img
                      src={getExplorerItemIcon(item)}
                      alt={item.name}
                      className="h-full w-full object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <span className={`text-center text-xs px-1 rounded break-words w-full truncate ${selectedItem === item.name ? 'bg-[#316ac5] text-white' : 'text-black'}`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          ) : viewMode === 'tiles' ? (
            // Tiles: 32px icon, name and a type line, filling the pane in a wrapping grid.
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
              {visibleItems.filter((item) => !(path === 'My Computer' && item.name === 'Network Neighborhood')).map((item, i) => (
                <div
                  key={i}
                  className={`flex min-w-0 cursor-pointer items-center gap-3 border p-2 ${selectedItem === item.name ? 'border-[#99d1ff] bg-[#cce8ff]' : 'border-transparent hover:bg-[#e5f3ff]'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item.name);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(item);
                  }}
                >
                  <img
                    src={getExplorerItemIcon(item)}
                    alt=""
                    className="h-8 w-8 shrink-0 object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm text-black">{item.name}</div>
                    <div className="truncate text-xs text-gray-500">
                      {item.type === 'folder' ? (isRu ? 'Папка с файлами' : 'File Folder') : item.type === 'drive' ? (isRu ? 'Локальный диск' : 'Local Disk') : (item.size ?? (isRu ? 'Файл' : 'File'))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'small' ? (
            // Small Icons: 16px icon with the name beside it, filling the pane in rows.
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-2 gap-y-1">
              {classicSystemEntries.length > 0
                ? classicSystemEntries.map((entry) => (
                  <div
                    key={entry.key}
                    className={`flex items-center gap-1.5 cursor-pointer px-1 py-0.5 min-w-0 ${selectedItem === entry.key ? 'bg-[#000080] text-white' : 'hover:bg-gray-100'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(entry.key);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      entry.open?.();
                    }}
                  >
                    <img src={entry.icon} alt="" className="h-4 w-4 shrink-0 object-contain" />
                    <span className={`truncate text-xs ${selectedItem === entry.key ? 'text-white' : 'text-black'}`}>{entry.label}</span>
                  </div>
                ))
                : visibleItems.filter((item) => !(path === 'My Computer' && item.name === 'Network Neighborhood')).map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 cursor-pointer px-1 py-0.5 min-w-0 ${selectedItem === item.name ? 'bg-[#000080] text-white' : 'hover:bg-gray-100'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item.name);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(item);
                    }}
                  >
                    <img
                      src={getExplorerItemIcon(item)}
                      alt=""
                      className="h-4 w-4 shrink-0 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className={`truncate text-xs ${selectedItem === item.name ? 'text-white' : 'text-black'}`}>{item.name}</span>
                  </div>
                ))}
            </div>
          ) : viewMode === 'icons' ? (
            path === 'My Computer' && (theme === 'win-98' || theme === 'win2000') ? (
              // Classic Windows (98 and 2000) list drives and system items in one flat grid.
              // Network Neighborhood is not under My Computer in either version.
              <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
                {classicSystemEntries.map((entry) => (
                  <div
                    key={entry.key}
                    className={`flex flex-col items-center cursor-pointer border border-transparent p-1 ${selectedItem === entry.key ? 'bg-[#000080] text-white' : 'hover:bg-gray-100'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(entry.key);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      entry.open?.();
                    }}
                  >
                    <div className="w-8 h-8 flex items-center justify-center mb-1">
                      <img src={entry.icon} alt="" className="w-8 h-8 object-contain" />
                    </div>
                    <span className={`text-center text-xs px-1 break-words w-full ${selectedItem === entry.key ? 'text-white' : 'text-black'}`}>
                      {entry.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : path === 'My Computer' ? (
              <div className="space-y-6">
                {visibleItems.filter((i) => i.type === 'folder' && i.name !== 'Network Neighborhood').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#003c74]/20 font-bold text-[#003c74] text-xs">
                      <span>{isRu ? 'Файлы, хранящиеся на этом компьютере' : 'Files Stored on This Computer'}</span>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
                      {visibleItems.filter((i) => i.type === 'folder' && i.name !== 'Network Neighborhood')
                        .map((item, i) => (
                          <div
                            key={i}
                            className={`flex flex-col items-center group cursor-pointer border border-transparent p-1 ${selectedItem === item.name ? 'bg-[#316ac5] bg-opacity-20 border-[#316ac5] border-opacity-30' : 'hover:bg-gray-100'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item.name);
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(item);
                            }}
                          >
                            <div className="w-16 h-16 flex items-center justify-center mb-1">
                              <img
                                src={resolveFileIcon(item, theme)}
                                alt={item.name}
                                className={`h-full w-full object-contain drop-shadow-md ${selectedItem === item.name ? 'opacity-80' : ''}`}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                            <span className={`text-center text-xs px-1 rounded break-words w-full ${selectedItem === item.name ? 'bg-[#316ac5] text-white' : 'text-black'}`}>
                              {item.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {visibleItems.filter((i) => i.type === 'drive').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#003c74]/20 font-bold text-[#003c74] text-xs">
                      <span>{isRu ? 'Жесткие диски' : 'Hard Disk Drives'}</span>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
                      {visibleItems.filter((i) => i.type === 'drive')
                        .map((item, i) => (
                          <div
                            key={i}
                            className={`flex flex-col items-center group cursor-pointer border border-transparent p-1 ${selectedItem === item.name ? 'bg-[#316ac5] bg-opacity-20 border-[#316ac5] border-opacity-30' : 'hover:bg-gray-100'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item.name);
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(item);
                            }}
                          >
                            <div className="w-16 h-16 flex items-center justify-center mb-1">
                              <img
                                src={resolveFileIcon(item, theme)}
                                alt={item.name}
                                className={`w-full h-full object-contain drop-shadow-md ${selectedItem === item.name ? 'opacity-80' : ''}`}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                            <span className={`text-center text-xs px-1 rounded break-words w-full ${selectedItem === item.name ? 'bg-[#316ac5] text-white' : 'text-black'}`}>
                              {item.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#003c74]/20 font-bold text-[#003c74] text-xs">
                    <span>{isRu ? 'Устройства со съёмными носителями' : 'Devices with Removable Storage'}</span>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
                    {[
                      { key: '3½ Floppy (A:)', label: isRu ? 'Дисковод 3½ (A:)' : '3½ Floppy (A:)', icon: xpFloppyIcon },
                      { key: 'CD Drive (D:)', label: isRu ? 'Дисковод CD (D:)' : 'CD Drive (D:)', icon: xpCdIcon },
                    ].map((entry) => (
                      <div
                        key={entry.key}
                        className={`flex flex-col items-center cursor-pointer border border-transparent p-1 ${selectedItem === entry.key ? 'bg-[#316ac5] bg-opacity-20 border-[#316ac5] border-opacity-30' : 'hover:bg-gray-100'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(entry.key);
                        }}
                      >
                        <div className="w-8 h-8 flex items-center justify-center mb-1">
                          <img src={entry.icon} alt="" className="w-8 h-8 object-contain" />
                        </div>
                        <span className={`text-center text-xs px-1 rounded break-words w-full ${selectedItem === entry.key ? 'bg-[#316ac5] text-white' : 'text-black'}`}>
                          {entry.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4">
                {visibleItems.map((item, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center group cursor-pointer border border-transparent p-1 ${selectedItem === item.name ? 'bg-[#316ac5] bg-opacity-20 border-[#316ac5] border-opacity-30' : 'hover:bg-gray-100'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item.name);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(item);
                    }}
                  >
                    <div className="w-16 h-16 flex items-center justify-center mb-1">
                      <img
                        src={resolveFileIcon(item, theme)}
                        alt={item.name}
                        className={`w-full h-full object-contain drop-shadow-md ${selectedItem === item.name ? 'opacity-80' : ''}`}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <span className={`text-center text-xs px-1 rounded break-words w-full ${selectedItem === item.name ? 'bg-[#316ac5] text-white' : 'text-black'}`}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#ece9d8] text-[#215dc6] uppercase text-[11px]">
                <tr>
                  <th className="px-3 py-2 font-semibold">{isRu ? 'Имя' : 'Name'}</th>
                  <th className="px-3 py-2 font-semibold w-32">{isRu ? 'Тип' : 'Type'}</th>
                  <th className="px-3 py-2 font-semibold w-32">{isRu ? 'Размер' : 'Size'}</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item, i) => (
                  <tr
                    key={i}
                    className={`cursor-pointer text-sm ${selectedItem === item.name ? 'bg-[#316ac5] text-white' : 'hover:bg-[#e2ecff]'}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedItem(item.name);
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      handleNavigate(item);
                    }}
                  >
                    <td className="px-3 py-1.5 flex items-center gap-2">
                      <img
                        src={resolveFileIcon(item, theme)}
                        alt={item.name}
                        className="w-5 h-5"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span>{item.name}</span>
                    </td>
                    <td className="px-3 py-1.5 text-[#215dc6]">
                      {item.type === 'folder'
                        ? (isRu ? 'Папка с файлами' : 'File Folder')
                        : item.type === 'drive'
                          ? (isRu ? 'Диск' : 'Drive')
                          : item.type === 'file'
                            ? (isRu ? 'Файл' : 'File')
                            : (isRu ? 'Элемент' : 'Item')}
                    </td>
                    <td className="px-3 py-1.5">{item.size || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#ece9d8] border-t border-[#aca899] px-2 py-0.5 text-[11px] text-black flex gap-4 justify-between shadow-inner">
        <div className="flex gap-4">
          <span>{path === 'My Computer' && (theme === 'win-98' || theme === 'win2000') ? (theme === 'win2000' ? 7 : 8) : path === 'My Computer' && theme === 'win-xp' ? 3 : visibleItems.length} {isRu ? 'объектов' : 'objects'}</span>
          {selectedItem && <span>{isRu ? 'Выбрано:' : 'Selected:'} {selectedItem}</span>}
        </div>
        {detailsForSelection && (
          <div className="flex gap-3 text-[#215dc6]">
            <span>{detailsForSelection.type}</span>
            {detailsForSelection.size && <span>{detailsForSelection.size}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
