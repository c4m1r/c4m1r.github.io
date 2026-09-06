import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { ChevronDown, ChevronUp } from 'lucide-react';
import folderIcon from '../../themes/winxp/assets/icons/folder_plain.png';
import computerIcon from '../../themes/winxp/assets/icons/mycomputer.png';
import searchIconXp from '../../themes/winxp/assets/toolbar/search.png';
import foldersToggleIcon from '../../themes/winxp/assets/toolbar/folders.png';
import viewThumbnailIcon from '../../themes/winxp/assets/toolbar/thumbnail.png';
import backIcon from '../../themes/winxp/assets/toolbar/back.png';
import forwardIcon from '../../themes/winxp/assets/toolbar/forward.png';
import upIcon from '../../themes/winxp/assets/toolbar/folder.png';
import goIcon from '../../themes/winxp/assets/toolbar/go.png';
import { getItemsFromPath, getFileIcon, FileSystemItem, initialFileSystem } from '../../utils/FileSystem';

export interface MyComputerProps {
  currentPath?: string;
  onOpenItem?: (item: FileSystemItem, parentPath: string) => void;
}

export function MyComputer({ currentPath = 'C:\\', onOpenItem }: MyComputerProps) {
  const { theme, language } = useApp();
  const isRu = language === 'ru';
  const [path, setPath] = useState(currentPath);
  const [history, setHistory] = useState<string[]>([currentPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState(currentPath);
  const isMyPictures = path.toLowerCase().includes('picture');
  const [viewMode, setViewMode] = useState<'thumbnails' | 'tiles' | 'icons' | 'list' | 'details'>(
    isMyPictures ? 'thumbnails' : 'icons'
  );
  const [showSidebar, setShowSidebar] = useState(true);
  const isWindowsXp = theme === 'win-xp';

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
    setAddressInput(currentPath);
    setSelectedItem(null);
    if (currentPath.toLowerCase().includes('picture')) {
      setViewMode('thumbnails');
    }
  }, [currentPath]);

  useEffect(() => {
    setAddressInput(path);
    if (path.toLowerCase().includes('picture')) {
      setViewMode('thumbnails');
    }
  }, [path]);

  const items = useMemo(() => getItemsFromPath(path), [path]);

  const navigateToPath = useCallback(
    (targetPath: string, recordHistory: boolean = true) => {
      const normalized = targetPath.replace('Local Disk (C:)', 'C:');
      setPath(normalized);
      setSelectedItem(null);

      if (recordHistory) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(normalized);
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
      else if (path.endsWith('\\') || path.endsWith(':')) newPath += item.name;
      else newPath += '\\' + item.name;

      newPath = newPath.replace('Local Disk (C:)', 'C:');
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
    let newPath = path;

    if (path === 'C:' || path === 'C:\\') {
      newPath = 'My Computer';
    } else if (path !== 'My Computer') {
      const parts = path.split('\\');
      parts.pop();
      newPath = parts.join('\\') || 'My Computer';
    } else {
      return;
    }

    navigateToPath(newPath);
  };

  const resolveNodeByPath = (target: string): FileSystemItem | null => {
    if (target === 'My Computer') {
      return initialFileSystem['My Computer'];
    }

    const normalized = target.replace('Local Disk (C:)', 'C:').replace(/\//g, '\\');
    const parts = normalized.split('\\').filter(Boolean);
    let current: FileSystemItem | undefined = initialFileSystem['My Computer'];

    for (const part of parts) {
      if (!current || !current.children) {
        return null;
      }

      if (current.children[part]) {
        current = current.children[part];
        continue;
      }

      const match: FileSystemItem | undefined = Object.values(current.children).find(child => child.name === part);
      if (!match) {
        return null;
      }
      current = match;
    }

    return current ?? null;
  };

  const pathExists = (target: string) => {
    if (target === 'My Computer') return true;
    const normalized = target.replace(/\//g, '\\');
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

    const normalized = target.replace(/\//g, '\\');
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
        const fileItem = parentItems.find(item => item.name === fileName);
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

  return (
    <div className="flex flex-col h-full bg-white font-tahoma text-xs select-none">
      {/* Toolbar */}
      <div className="flex flex-col border-b border-[#aca899]">
        {/* Menu Bar */}
        <div className="flex items-center px-1 bg-[#ece9d8] border-b border-[#aca899]">
          {menuItems.map((item) => (
            <button
              key={item}
              className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white transition-colors cursor-default text-black bg-transparent border-0"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Standard Action Buttons */}
        <div className="flex items-center p-1 bg-[#ece9d8] gap-1 border-b border-[#aca899]">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/60 active:bg-gray-200 disabled:opacity-40 text-black border-0 bg-transparent"
          >
            <img src={backIcon} alt="" className="w-5 h-5 object-contain" />
            <span>{isRu ? 'Назад' : 'Back'}</span>
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/60 active:bg-gray-200 disabled:opacity-40 text-black border-0 bg-transparent"
          >
            <img src={forwardIcon} alt="" className="w-5 h-5 object-contain" />
            <span>{isRu ? 'Вперед' : 'Forward'}</span>
          </button>
          <button
            onClick={handleUp}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/60 active:bg-gray-200 text-black border-0 bg-transparent"
          >
            <img src={upIcon} alt="" className="w-5 h-5 object-contain" />
            <span>{isRu ? 'Вверх' : 'Up'}</span>
          </button>
          <div className="w-px h-6 bg-gray-400 mx-1" />
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/60 text-black border-0 bg-transparent">
            <img src={searchIconXp} alt="" className="w-4 h-4 object-contain" />
            <span>{isRu ? 'Поиск' : 'Search'}</span>
          </button>
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded border border-transparent hover:bg-white/60 text-black ${showSidebar ? 'bg-white/60 border-gray-400' : 'bg-transparent'}`}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <img src={foldersToggleIcon} alt="" className="w-4 h-4 object-contain" />
            <span>{isRu ? 'Папки' : 'Folders'}</span>
          </button>
          <div className="w-px h-6 bg-gray-400 mx-1" />
          <button
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/60 text-black border-0 bg-transparent"
            onClick={() => {
              const modes: Array<'thumbnails' | 'icons' | 'details'> = ['thumbnails', 'icons', 'details'];
              const currentMode = (viewMode === 'thumbnails' || viewMode === 'icons' || viewMode === 'details') ? viewMode : 'icons';
              const nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
              setViewMode(modes[nextIndex]);
            }}
          >
            <img src={viewThumbnailIcon} alt="" className="w-4 h-4 object-contain" />
            <span>{isRu ? 'Виды' : 'Views'}</span>
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex items-center p-1 bg-[#ece9d8] gap-2">
          <span className="text-gray-600 font-semibold">{isRu ? 'Адрес' : 'Address'}</span>
          <div className="flex-1 bg-white border border-[#7f9db9] flex items-center px-1 h-5 shadow-inner">
            <img src={path === 'My Computer' ? computerIcon : folderIcon} className="w-4 h-4 mr-1.5 object-contain" alt="" />
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
                        const pictureItems = items.filter(i => /\.(png|jpg|jpeg|gif)$/i.test(i.name));
                        if (pictureItems.length > 0 && onOpenItem) {
                          onOpenItem(pictureItems[0], path);
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
                  <div className="font-bold">{path === 'My Computer' ? (isRu ? 'Мой компьютер' : 'My Computer') : path.split('\\').pop()}</div>
                  <div>{isRu ? 'Системная папка' : 'System Folder'}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Pane */}
        <div className="flex-1 bg-white p-4 overflow-y-auto" onClick={() => setSelectedItem(null)}>
          {viewMode === 'thumbnails' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {items.map((item, i) => (
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
                      src={getFileIcon(item) as string}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <span className={`text-center text-xs px-1 rounded break-words w-full truncate ${selectedItem === item.name ? 'bg-[#316ac5] text-white' : 'text-black'}`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          ) : viewMode === 'icons' ? (
            path === 'My Computer' ? (
              <div className="space-y-6">
                {items.filter((i) => i.type === 'folder').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#003c74]/20 font-bold text-[#003c74] text-xs">
                      <span>{isRu ? 'Файлы, хранящиеся на этом компьютере' : 'Files Stored on This Computer'}</span>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
                      {items
                        .filter((i) => i.type === 'folder')
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
                            <div className="w-12 h-12 flex items-center justify-center mb-1">
                              <img
                                src={getFileIcon(item) as string}
                                alt={item.name}
                                className={`max-w-full max-h-full drop-shadow-md ${selectedItem === item.name ? 'opacity-80' : ''}`}
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

                {items.filter((i) => i.type === 'drive').length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#003c74]/20 font-bold text-[#003c74] text-xs">
                      <span>{isRu ? 'Жесткие диски' : 'Hard Disk Drives'}</span>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
                      {items
                        .filter((i) => i.type === 'drive')
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
                            <div className="w-12 h-12 flex items-center justify-center mb-1">
                              <img
                                src={getFileIcon(item) as string}
                                alt={item.name}
                                className={`max-w-full max-h-full drop-shadow-md ${selectedItem === item.name ? 'opacity-80' : ''}`}
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
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4">
                {items.map((item, i) => (
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
                    <div className="w-12 h-12 flex items-center justify-center mb-1">
                      <img
                        src={getFileIcon(item) as string}
                        alt={item.name}
                        className={`max-w-full max-h-full drop-shadow-md ${selectedItem === item.name ? 'opacity-80' : ''}`}
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
                {items.map((item, i) => (
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
                        src={getFileIcon(item) as string}
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
          <span>{items.length} {isRu ? 'объектов' : 'objects'}</span>
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
