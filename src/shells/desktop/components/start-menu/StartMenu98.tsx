import { cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from 'react';
import { useApp } from '../../../../contexts/useApp';
import { getSessionAccount } from '../../../../domain/auth/session';
import { buildClassicStartMenu, type ClassicMenuItem } from './startMenuClassicLists';
import { getActiveEdition } from '../../../os/osEditions';

export interface StartMenu98Props {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
}




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

  const menuItems = buildClassicStartMenu({ isWin2000, isRu, account });

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
