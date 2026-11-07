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

export function StartMenu98({ onClose, onSystemCommand, onHover }: StartMenu98Props) {
  const { theme } = useApp();
  const isWin2000 = theme === 'win2000';
  const activeEdition = getActiveEdition(theme);
  const menuItems = [
    { label: 'Programs', icon: <Folder size={16} /> },
    { label: 'Favorites', icon: <Star size={16} /> },
    { label: 'Documents', icon: <FileText size={16} /> },
    { label: 'Settings', icon: <Settings size={16} /> },
    { label: 'Find', icon: <Search size={16} /> },
    { label: 'Help', icon: <HelpCircle size={16} /> },
    { label: 'Run...', icon: <Play size={16} /> },
    { label: 'Log Off...', icon: <LogOut size={16} />, action: 'logoff' as const },
    { label: 'Shut Down...', icon: <Power size={16} />, action: 'shutdown' as const },
  ];

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
      {/* Windows Classic Sidebar */}
      <div 
        className="w-8 flex items-end justify-center pb-2 os-sidebar select-none"
        style={{
          background: isWin2000 ? 'linear-gradient(to top, #000080, #1084d0)' : '#000080',
        }}
      >
        <span 
          className="text-white font-bold text-lg transform -rotate-90 whitespace-nowrap tracking-widest origin-bottom-center"
          style={{
            fontFamily: 'MS Sans Serif, sans-serif',
          }}
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

      {/* Menu Items */}
      <div className="flex-1 py-1 os-list">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className="w-full text-left px-2 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-2 text-sm transition-colors os-list-item os-button"
            style={{
              fontFamily: 'MS Sans Serif, sans-serif',
            }}
            onClick={() => {
              if (item.action) {
                onSystemCommand?.(item.action);
              }
              onClose();
            }}
            onMouseEnter={() => onHover?.()}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
