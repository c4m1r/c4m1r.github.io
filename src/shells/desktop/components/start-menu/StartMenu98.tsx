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
  icon: React.ReactNode;
  appId?: string;
  path?: string;
  action?: 'logoff' | 'shutdown';
};

const DOCUMENTS_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents';
const PICTURES_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Pictures';
const DESKTOP_PATH = 'C:\\Documents and Settings\\C4m1r\\Desktop';

export function StartMenu98({ onClose, onLaunchApp, onOpenPath, onSystemCommand, onHover }: StartMenu98Props) {
  const { theme, language } = useApp();
  const isRu = language === 'ru';
  const isWin2000 = theme === 'win2000';
  const activeEdition = getActiveEdition(theme);
  const menuItems: ClassicMenuItem[] = [
    { label: isRu ? 'Программы' : 'Programs', icon: <Folder size={16} />, path: 'C:\\Program Files' },
    { label: isRu ? 'Избранное' : 'Favorites', icon: <Star size={16} />, path: DESKTOP_PATH },
    { label: isRu ? 'Документы' : 'Documents', icon: <FileText size={16} />, path: DOCUMENTS_PATH },
    { label: isRu ? 'Мой компьютер' : 'My Computer', icon: <Folder size={16} />, appId: 'my-computer' },
    { label: isRu ? 'Мои рисунки' : 'My Pictures', icon: <FileText size={16} />, path: PICTURES_PATH },
    { label: isRu ? 'Настройка' : 'Settings', icon: <Settings size={16} />, appId: 'control-panel' },
    { label: isRu ? 'Поиск' : 'Find', icon: <Search size={16} />, path: 'My Computer' },
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
          <button
            key={item.label}
            type="button"
            className="w-full text-left px-2 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 text-sm transition-colors os-list-item os-button"
            style={{ fontFamily: 'MS Sans Serif, sans-serif' }}
            onClick={() => activate(item)}
            onMouseEnter={onHover}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
