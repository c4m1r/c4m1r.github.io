import { useEffect, useRef, useState } from 'react';

export interface GameMenuItem {
  label: string;
  onSelect?: () => void;
  /** Present on radio-style items; `true` marks the current choice with a dot. */
  checked?: boolean;
  disabled?: boolean;
  shortcut?: string;
  separator?: boolean;
}

export interface GameMenu {
  label: string;
  items: GameMenuItem[];
}

/**
 * Classic Windows menu bar for the card games. Menus open on click; once one is open,
 * hovering another menu switches to it. Clicking outside closes the menu.
 */
export function GameMenuBar({ menus }: { menus: GameMenu[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const closeOnOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpenIndex(null);
    };
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [openIndex]);

  return (
    <div ref={rootRef} role="menubar" className="flex select-none border-b border-[#808080] bg-[#c0c0c0] text-xs text-black">
      {menus.map((menu, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={menu.label} className="relative">
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              onMouseEnter={() => { if (openIndex !== null) setOpenIndex(index); }}
              className={`border-0 bg-transparent px-2 py-0.5 ${isOpen ? 'bg-[#000080] text-white' : 'text-black'}`}
            >
              {menu.label}
            </button>
            {isOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full z-50 min-w-[170px] border border-[#808080] bg-[#c0c0c0] py-0.5 shadow-[2px_2px_0_#404040]"
              >
                {menu.items.map((item, itemIndex) =>
                  item.separator ? (
                    <div key={`sep-${itemIndex}`} className="my-0.5 border-b border-t border-[#808080] border-b-white" />
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      role={item.checked === undefined ? 'menuitem' : 'menuitemradio'}
                      aria-checked={item.checked}
                      disabled={item.disabled}
                      onClick={() => { setOpenIndex(null); item.onSelect?.(); }}
                      className="flex w-full items-center justify-between gap-6 border-0 bg-transparent px-4 py-0.5 text-left hover:bg-[#000080] hover:text-white disabled:text-[#808080] disabled:hover:bg-transparent"
                    >
                      <span>{item.checked === undefined ? item.label : `${item.checked ? '• ' : '   '}${item.label}`}</span>
                      {item.shortcut && <span>{item.shortcut}</span>}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
