import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  LayoutGrid,
  Search,
} from 'lucide-react';
import { useApp } from '../../contexts/useApp';
import { THEME_ASSETS } from '../../themes/webos/themeAssets';
import { getFileIcon, getItemsFromPath, type FileSystemItem } from '../../utils/FileSystem';
import type { MyComputerProps } from './MyComputer';

const PATHS = {
  desktop: 'C:\\Documents and Settings\\C4m1r\\Desktop',
  documents: 'C:\\Documents and Settings\\C4m1r\\My Documents',
  pictures: 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Pictures',
  music: 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Music',
} as const;

type Win7ViewMode = 'icons' | 'details';

function joinWindowsPath(parent: string, child: string) {
  if (!parent || parent === 'My Computer') return child;
  if (parent.endsWith(':')) return `${parent}\\${child}`;
  if (parent.endsWith('\\')) return `${parent}${child}`;
  return `${parent}\\${child}`;
}

function displayLocation(path: string, isRu: boolean) {
  if (path === 'My Computer') return isRu ? 'Компьютер' : 'Computer';
  if (path === PATHS.desktop) return isRu ? 'Рабочий стол' : 'Desktop';
  if (path === PATHS.documents) return isRu ? 'Документы' : 'Documents';
  if (path === PATHS.pictures) return isRu ? 'Изображения' : 'Pictures';
  if (path === PATHS.music) return isRu ? 'Музыка' : 'Music';
  return path
    .replace('C:\\', `${isRu ? 'Локальный диск' : 'Local Disk'} (C:) > `)
    .split('\\')
    .join(' > ');
}

export function Windows7Explorer({ currentPath = 'My Computer', onOpenItem }: MyComputerProps) {
  const { language } = useApp();
  const isRu = language === 'ru';
  const assets = THEME_ASSETS.win7;
  const [path, setPath] = useState(currentPath);
  const [history, setHistory] = useState<string[]>([currentPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<Win7ViewMode>('icons');
  const [addressEditing, setAddressEditing] = useState(false);
  const [addressInput, setAddressInput] = useState(currentPath);

  useEffect(() => {
    setPath(currentPath);
    setHistory([currentPath]);
    setHistoryIndex(0);
    setSearchQuery('');
    setSelectedItem(null);
    setAddressInput(currentPath);
  }, [currentPath]);

  useEffect(() => {
    setAddressInput(path);
    setSearchQuery('');
    setSelectedItem(null);
  }, [path]);

  const navigateToPath = useCallback((targetPath: string, recordHistory = true) => {
    const normalized = targetPath.replace('Local Disk (C:)', 'C:');
    setPath(normalized);
    if (!recordHistory) return;

    setHistory((currentHistory) => {
      const next = currentHistory.slice(0, historyIndex + 1);
      next.push(normalized);
      setHistoryIndex(next.length - 1);
      return next;
    });
  }, [historyIndex]);

  const rawItems = useMemo(() => getItemsFromPath(path), [path]);
  const items = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase(language);
    if (!query) return rawItems;
    return rawItems.filter((item) => item.name.toLocaleLowerCase(language).includes(query));
  }, [language, rawItems, searchQuery]);
  const selectedFileSystemItem = useMemo(
    () => rawItems.find((item) => item.name === selectedItem) ?? null,
    [rawItems, selectedItem],
  );

  const handleBack = () => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setPath(history[nextIndex]);
  };

  const handleForward = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setPath(history[nextIndex]);
  };

  const handleUp = () => {
    if (path === 'My Computer') return;
    if (path === 'C:' || path === 'C:\\') {
      navigateToPath('My Computer');
      return;
    }
    const parts = path.split('\\').filter(Boolean);
    parts.pop();
    navigateToPath(parts.length ? parts.join('\\') : 'My Computer');
  };

  const handleOpen = (item: FileSystemItem) => {
    if (item.type === 'folder' || item.type === 'drive') {
      if (path === 'My Computer' && item.name === 'Local Disk (C:)') {
        navigateToPath('C:');
      } else {
        navigateToPath(joinWindowsPath(path, item.name));
      }
      return;
    }
    onOpenItem?.(item, path);
  };

  const handleAddressKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setAddressEditing(false);
      setAddressInput(path);
      return;
    }
    if (event.key !== 'Enter') return;
    const target = addressInput.trim();
    if (!target) return;
    navigateToPath(target);
    setAddressEditing(false);
  };

  const navGroups = [
    {
      title: isRu ? 'Избранное' : 'Favorites',
      entries: [
        { id: 'desktop', label: isRu ? 'Рабочий стол' : 'Desktop', path: PATHS.desktop, icon: '🖥️' },
        { id: 'downloads', label: isRu ? 'Загрузки' : 'Downloads', path: PATHS.documents, icon: '⬇️' },
        { id: 'recent', label: isRu ? 'Недавние места' : 'Recent Places', path: PATHS.desktop, icon: '🕘' },
      ],
    },
    {
      title: isRu ? 'Библиотеки' : 'Libraries',
      entries: [
        { id: 'documents', label: isRu ? 'Документы' : 'Documents', path: PATHS.documents, icon: '📄' },
        { id: 'music', label: isRu ? 'Музыка' : 'Music', path: PATHS.music, icon: '🎵' },
        { id: 'pictures', label: isRu ? 'Изображения' : 'Pictures', path: PATHS.pictures, icon: '🖼️' },
        { id: 'videos', label: isRu ? 'Видео' : 'Videos', path: PATHS.documents, icon: '🎞️' },
      ],
    },
  ];

  const locationTitle = displayLocation(path, isRu);

  return (
    <div className="win7-explorer flex h-full min-h-0 flex-col bg-white text-[#1f1f1f] select-none">
      <div className="win7-explorer__navigation">
        <div className="win7-explorer__history-buttons">
          <button type="button" onClick={handleBack} disabled={historyIndex === 0} aria-label={isRu ? 'Назад' : 'Back'}>
            <ChevronLeft size={17} />
          </button>
          <button type="button" onClick={handleForward} disabled={historyIndex >= history.length - 1} aria-label={isRu ? 'Вперед' : 'Forward'}>
            <ChevronRight size={17} />
          </button>
          <button type="button" className="win7-explorer__history-menu" aria-label={isRu ? 'Последние страницы' : 'Recent pages'}>
            <ChevronDown size={10} />
          </button>
        </div>

        <button type="button" className="win7-explorer__up" onClick={handleUp} disabled={path === 'My Computer'} title={isRu ? 'На один уровень вверх' : 'Up one level'}>
          ↑
        </button>

        <div className={`win7-explorer__address ${addressEditing ? 'is-editing' : ''}`} onDoubleClick={() => setAddressEditing(true)}>
          <img src={path === 'My Computer' ? assets.computerIcon : assets.folderIcon} alt="" />
          {addressEditing ? (
            <input
              autoFocus
              value={addressInput}
              onChange={(event) => setAddressInput(event.currentTarget.value)}
              onKeyDown={handleAddressKeyDown}
              onBlur={() => {
                setAddressEditing(false);
                setAddressInput(path);
              }}
            />
          ) : (
            <button type="button" onClick={() => setAddressEditing(true)} title={path}>
              {locationTitle}
            </button>
          )}
          <ChevronDown size={11} aria-hidden="true" />
        </div>

        <label className="win7-explorer__search">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            placeholder={`${isRu ? 'Поиск' : 'Search'} ${locationTitle}`}
            aria-label={isRu ? 'Поиск' : 'Search'}
          />
          <Search size={15} aria-hidden="true" />
        </label>
      </div>

      <div className="win7-explorer__commandbar">
        <button type="button">{isRu ? 'Упорядочить' : 'Organize'} <ChevronDown size={10} /></button>
        <span className="win7-explorer__commandbar-separator" />
        <button type="button" disabled={!selectedFileSystemItem} onClick={() => selectedFileSystemItem && handleOpen(selectedFileSystemItem)}>
          {isRu ? 'Открыть' : 'Open'}
        </button>
        <button type="button">{isRu ? 'Общий доступ' : 'Share with'} <ChevronDown size={10} /></button>
        <button type="button" disabled>{isRu ? 'Электронная почта' : 'E-mail'}</button>
        <button type="button" disabled><FolderPlus size={14} /> {isRu ? 'Новая папка' : 'New folder'}</button>
        <div className="win7-explorer__commandbar-spacer" />
        <button type="button" className="win7-explorer__view-button" onClick={() => setViewMode((current) => current === 'icons' ? 'details' : 'icons')} title={isRu ? 'Изменить представление' : 'Change your view'}>
          <LayoutGrid size={15} />
          <ChevronDown size={9} />
        </button>
      </div>

      <div className="win7-explorer__body">
        <aside className="win7-explorer__sidebar">
          {navGroups.map((group) => (
            <section key={group.title}>
              <h3><ChevronDown size={10} /> {group.title}</h3>
              {group.entries.map((entry) => (
                <button key={entry.id} type="button" className={path === entry.path ? 'is-active' : ''} onClick={() => navigateToPath(entry.path)}>
                  <span aria-hidden="true">{entry.icon}</span>
                  {entry.label}
                </button>
              ))}
            </section>
          ))}

          <section>
            <button type="button" className={path === 'My Computer' ? 'is-active win7-explorer__tree-root' : 'win7-explorer__tree-root'} onClick={() => navigateToPath('My Computer')}>
              <img src={assets.computerIcon} alt="" />
              {isRu ? 'Компьютер' : 'Computer'}
            </button>
            <button type="button" className="win7-explorer__tree-root" disabled>
              <span aria-hidden="true">🏠</span>
              {isRu ? 'Домашняя группа' : 'Homegroup'}
            </button>
            <button type="button" className="win7-explorer__tree-root" disabled>
              <span aria-hidden="true">🌐</span>
              {isRu ? 'Сеть' : 'Network'}
            </button>
          </section>
        </aside>

        <main className="win7-explorer__content" onClick={() => setSelectedItem(null)}>
          <div className="win7-explorer__content-heading">
            <h2>{locationTitle}</h2>
            <span>{items.length} {isRu ? 'элем.' : items.length === 1 ? 'item' : 'items'}</span>
          </div>

          {items.length === 0 ? (
            <div className="win7-explorer__empty">
              {searchQuery
                ? (isRu ? 'Нет элементов, удовлетворяющих условиям поиска.' : 'No items match your search.')
                : (isRu ? 'Эта папка пуста.' : 'This folder is empty.')}
            </div>
          ) : viewMode === 'details' ? (
            <div className="win7-explorer__details">
              <div className="win7-explorer__details-header">
                <span>{isRu ? 'Имя' : 'Name'}</span>
                <span>{isRu ? 'Дата изменения' : 'Date modified'}</span>
                <span>{isRu ? 'Тип' : 'Type'}</span>
                <span>{isRu ? 'Размер' : 'Size'}</span>
              </div>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={selectedItem === item.name ? 'is-selected' : ''}
                  onClick={(event) => { event.stopPropagation(); setSelectedItem(item.name); }}
                  onDoubleClick={() => handleOpen(item)}
                >
                  <span className="win7-explorer__details-name"><img src={getFileIcon(item) as string} alt="" />{item.name}</span>
                  <span>—</span>
                  <span>{item.type === 'folder' ? (isRu ? 'Папка с файлами' : 'File folder') : item.type === 'drive' ? (isRu ? 'Локальный диск' : 'Local Disk') : (isRu ? 'Файл' : 'File')}</span>
                  <span>{item.size ?? ''}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="win7-explorer__icons">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={selectedItem === item.name ? 'is-selected' : ''}
                  onClick={(event) => { event.stopPropagation(); setSelectedItem(item.name); }}
                  onDoubleClick={() => handleOpen(item)}
                >
                  <img src={getFileIcon(item) as string} alt="" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      <div className="win7-explorer__statusbar">
        <span>{items.length} {isRu ? 'элементов' : items.length === 1 ? 'item' : 'items'}</span>
        {selectedItem ? <span>{selectedItem}</span> : null}
      </div>
    </div>
  );
}
