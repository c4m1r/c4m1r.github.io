import { useState } from 'react';
import { useApp } from '../../../../contexts/useApp';
import { getSessionAccount } from '../../../../domain/auth/session';
import { buildClassicStartMenu, type ClassicMenuItem } from './startMenuClassicLists';
import { getActiveEdition } from '../../../os/osEditions';
import { THEME_ASSETS } from '../../../../themes/webos/themeAssets';

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
  // Windows 2000 chrome is native pixel art (banner, separator, submenu arrow); Windows 98 draws its own.
  const chrome = isWin2000 ? THEME_ASSETS.win2000 : undefined;

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

  const renderItems = (items: ClassicMenuItem[], depth: number) => (
    <>
      {items.map((item, index) => {
        if (item.separator) {
          // Reference gaps: Windows 98 separator is 9 px tall (4 + 3 margin + 2 border), Windows 2000 is 6 px (2 + 2 + 2).
          if (chrome?.startMenuSeparator) {
            return (
              <div
                key={`sep-${index}`}
                className="mx-1"
                style={{
                  height: 2,
                  marginTop: 3,
                  marginBottom: 3,
                  backgroundImage: `url(${chrome.startMenuSeparator})`,
                  backgroundRepeat: 'repeat-x',
                }}
              />
            );
          }
          return (
            <div
              key={`sep-${index}`}
              className="mx-1 border-t border-[#808080] border-b border-white"
              style={{ marginTop: 4, marginBottom: 3 }}
            />
          );
        }
        const isOpen = !!item.submenu && openChain[depth] === item.label;
        return (
          <div key={item.label} className="relative">
            <button
              type="button"
              className={`w-full text-left px-2 flex items-center os-list-item os-button ${isOpen ? '!bg-[#000080] !text-white' : 'hover:!bg-[#000080] hover:!text-white'}`}
              style={{
                gap: depth === 0 && !isWin2000 ? 4 : 8,
                fontFamily: 'MS Sans Serif, sans-serif',
                fontSize: 12,
                lineHeight: '16px',
                // Rows are flat in the reference: the shared button bevel (box-shadow and borders) is removed,
                // so the row height is the pitch.
                border: 0,
                boxShadow: 'none',
                padding: depth === 0 ? '0 8px' : '3px 8px',
                // Top-level rows are 32 px (the native icon size) on both skins; submenu rows are 22 px.
                minHeight: depth === 0 ? 32 : 22,
              }}
              onClick={() => (item.submenu ? openAt(depth, isOpen ? null : item.label) : activate(item))}
              onMouseEnter={() => {
                onHover?.();
                openAt(depth, item.submenu ? item.label : null);
              }}
              aria-expanded={item.submenu ? isOpen : undefined}
            >
              {item.icon}
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
              {item.submenu ? (
                chrome?.startMenuArrow ? (
                  <img src={chrome.startMenuArrow} alt="" width={4} height={7} style={{ imageRendering: 'pixelated' }} />
                ) : (
                  <span aria-hidden="true">›</span>
                )
              ) : null}
            </button>
            {isOpen && item.submenu && (
              <div
                className={`absolute left-full top-0 z-[100001] ${isWin2000 ? 'min-w-52' : 'w-[138px]'} py-1`}
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
      className={`absolute ${isWin2000 ? 'bottom-[28px] left-0' : 'bottom-[26px] left-1 w-40'} flex z-50 os-panel`}
      style={{
        // Reference: Windows 2000 menus use the 2000 window face (#d4d0c8); Windows 98 uses #c0c0c0.
        background: isWin2000 ? '#d4d0c8' : '#c0c0c0',
        // The 2000 menu grows to its longest label (e.g. "Shut Down..." or the Russian names), never clips them.
        ...(isWin2000 ? { minWidth: 174, width: 'max-content' } : {}),
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
          width: isWin2000 ? 21 : 22,
          flexShrink: 0,
          flexDirection: 'row',
          // Windows 2000: the native banner (black top, blue foot, lettering in the art) sits at the bottom.
          // Windows 98: a solid navy strip with its own lettering.
          background: chrome?.startMenuSidebar
            ? `url(${chrome.startMenuSidebar}) bottom / 21px auto no-repeat, #000000`
            : '#000080',
        }}
      >
        {!isWin2000 && <span
          className="text-white whitespace-nowrap"
          style={{
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: isWin2000 ? 16 : 22,
            lineHeight: 1,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            letterSpacing: isWin2000 ? 0 : '-0.5px',
            paddingBottom: 4,
          }}
        >
          {activeEdition?.id === 'second-edition' ? (
            <><b className="text-[#c0c0c0]">Windows</b><span className="font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>98</span><span className="font-bold text-xs ml-1 text-yellow-300">SE</span></>
          ) : (
            <><b className="text-[#c0c0c0]">Windows</b><span className="font-normal" style={{ fontFamily: 'Arial, sans-serif' }}>98</span></>
          )}
        </span>}
      </div>
      {/* The shared .os-list is a scroll box; the classic menu sizes to its items instead. */}
      <div className="flex-1 min-w-0 os-list" style={{ overflow: 'visible', height: 'auto', background: 'transparent', paddingTop: 4, paddingBottom: 0 }}>
        {renderItems(menuItems, 0)}
      </div>
    </div>
  );
}
