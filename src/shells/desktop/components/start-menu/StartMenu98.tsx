import { useState, type ReactNode } from 'react';
import { Folder, Star, FileText, Settings, Search, HelpCircle, Play, LogOut, Power } from 'lucide-react';
import { useApp } from '../../../../contexts/useApp';
import { getActiveEdition } from '../../../os/osEditions';

export interface StartMenu98Props {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
}

type ClassicMenuItem = {
  label: string;
  icon: ReactNode;
  appId?: string;
  path?: string;
  action?: 'logoff' | 'shutdown';
  submenu?: ClassicMenuItem[];
};

const DOCUMENTS_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents';
const PICTURES_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Pictures';
const DESKTOP_PATH = 'C:\\Documents and Settings\\C4m1r\\Desktop';

export function StartMenu98({ onClose, onLaunchApp, onOpenPath, onSystemCommand, onHover }: StartMenu98Props) {
  const { theme, language } = useApp();
  const isRu = language === 'ru';
  const isWin2000 = theme === 'win2000';
  const [programsOpen, setProgramsOpen] = useState(false);
  const activeEdition = getActiveEdition(theme);
  const menuItems: ClassicMenuItem[] = [
    { label: isRu ? 'Программы' : 'Programs', icon: <Folder size={16} />, submenu: [
      { label: 'Internet Explorer', icon: <Folder size={16} />, appId: 'internet-explorer' },
      { label: 'Outlook Express', icon: <Folder size={16} />, appId: 'outlook' },
      { label: 'Windows Media Player', icon: <Folder size={16} />, appId: 'windows-media-player' },
      { label: 'Winamp', icon: <Folder size={16} />, appId: 'winamp' },
      { label: isRu ? 'Блокнот' : 'Notepad', icon: <FileText size={16} />, appId: 'notepad' },
      { label: isRu ? 'Калькулятор' : 'Calculator', icon: <FileText size={16} />, appId: 'calculator' },
      { label: isRu ? 'Панель управления' : 'Control Panel', icon: <Settings size={16} />, appId: 'control-panel' },
      { label: 'DOOM', icon: <Folder size={16} />, appId: 'doom1' },
      { label: 'DOOM II', icon: <Folder size={16} />, appId: 'doom2' },
      { label: isRu ? 'Сапёр' : 'Minesweeper', icon: <Folder size={16} />, appId: 'minesweeper' },
    ] },
    { label: isRu ? 'Избранное' : 'Favorites', icon: <Star size={16} />, path: DESKTOP_PATH },
    { label: isRu ? 'Документы' : 'Documents', icon: <FileText size={16} />, path: DOCUMENTS_PATH },
    { label: isRu ? 'Мой компьютер' : 'My Computer', icon: <Folder size={16} />, appId: 'my-computer' },
    { label: isRu ? 'Сетевое окружение' : 'Network Neighborhood', icon: <Folder size={16} />, path: 'Network Neighborhood' },
    { label: isRu ? 'Мои рисунки' : 'My Pictures', icon: <FileText size={16} />, path: PICTURES_PATH },
    { label: isRu ? 'Настройка' : 'Settings', icon: <Settings size={16} />, appId: 'control-panel' },
    { label: isRu ? 'Поиск' : 'Find', icon: <Search size={16} />, appId: 'search' },
    { label: isRu ? 'Справка' : 'Help', icon: <HelpCircle size={16} />, appId: 'wiki' },
    { label: isRu ? 'Выполнить...' : 'Run...', icon: <Play size={16} />, appId: 'run' },
    { label: isRu ? 'Завершение сеанса...' : 'Log Off...', icon: <LogOut size={16} />, action: 'logoff' },
    { label: isRu ? 'Выключение...' : 'Shut Down...', icon: <Power size={16} />, action: 'shutdown' },
  ];

  const activate = (item: ClassicMenuItem) => {
    if (item.action) onSystemCommand?.(item.action);
    else if (item.appId) onLaunchApp?.(item.appId);
    else if (item.path) onOpenPath?.(item.path);
    onClose();
  };

  return (
    <div
      className="absolute bottom-[32px] left-1 w-52 flex z-50 os-panel"
      style={{
        background: '#c0c0c0',
        border: '2px solid',
        borderColor: '#ffffff #000000 #000000 #ffffff',
        boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        className="w-8 flex items-end justify-center pb-2 os-sidebar select-none"
        style={{ background: isWin2000 ? 'linear-gradient(to top, #000080, #1084d0)' : '#000080' }}
      >
        <span
          className="text-white font-bold text-lg transform -rotate-90 whitespace-nowrap tracking-widest origin-bottom-center"
          style={{ fontFamily: 'MS Sans Serif, sans-serif' }}
        >
          {isWin2000 ? (
            <>Windows<span className="font-normal text-xs ml-1">{activeEdition?.label ?? '2000'}</span></>
          ) : activeEdition?.id === 'second-edition' ? (
            <>Windows<span className="font-normal">98</span><span className="font-bold text-xs ml-1 text-yellow-300">SE</span></>
          ) : (
            <>Windows<span className="font-normal">98</span></>
          )}
        </span>
      </div>
      <div className="flex-1 py-1 os-list">
        {menuItems.map((item) => (
          <div key={item.label} className="relative">
            <button
              type="button"
              className="w-full text-left px-2 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 text-sm transition-colors os-list-item os-button"
              style={{ fontFamily: 'MS Sans Serif, sans-serif' }}
              onClick={() => item.submenu ? setProgramsOpen((open) => !open) : activate(item)}
              onMouseEnter={() => { onHover?.(); if (item.submenu) setProgramsOpen(true); }}
              aria-expanded={item.submenu ? programsOpen : undefined}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.submenu ? <span aria-hidden="true">›</span> : null}
            </button>
            {item.submenu && programsOpen && (
              <div className="absolute left-full top-0 z-[100001] min-w-52 border-2 border-solid border-white bg-[#c0c0c0] py-1 shadow-lg">
                {item.submenu.map((entry) => (
                  <button
                    key={entry.appId ?? entry.label}
                    type="button"
                    className="flex w-full items-center gap-2 px-2 py-1 text-left text-sm hover:bg-[#000080] hover:text-white"
                    style={{ fontFamily: 'MS Sans Serif, sans-serif' }}
                    onClick={() => activate(entry)}
                    onMouseEnter={onHover}
                  >
                    {entry.icon}<span>{entry.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
