/**
 * Universal desktop context menu.
 * XP presentation is handled by the OS-specific CSS layer.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../../contexts/useApp';

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export interface ContextMenuItem {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
  icon?: string;
  submenu?: ContextMenuItem[];
}

const RU_LABELS: Record<string, string> = {
  Open: 'Открыть',
  Cut: 'Вырезать',
  Copy: 'Копировать',
  'Create Shortcut': 'Создать ярлык',
  Delete: 'Удалить',
  Rename: 'Переименовать',
  Properties: 'Свойства',
  'Open With': 'Открыть с помощью',
  'Send To': 'Отправить',
};

function ContextMenuLevel({
  items,
  onClose,
  isSubmenu = false,
}: {
  items: ContextMenuItem[];
  onClose: () => void;
  isSubmenu?: boolean;
}) {
  const { language } = useApp();
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);

  const localizedItems = useMemo(() => {
    if (language !== 'ru') return items;
    return items.map((item) => ({
      ...item,
      label: item.label ? (RU_LABELS[item.label] ?? item.label) : item.label,
    }));
  }, [items, language]);

  return (
    <div className={`desktop-context-menu ${isSubmenu ? 'desktop-context-menu--submenu' : ''}`} role="menu">
      {localizedItems.map((item, index) => {
        if (item.separator) {
          return <div key={`separator-${index}`} className="desktop-context-menu__separator" role="separator" />;
        }

        const hasSubmenu = Boolean(item.submenu?.length);
        return (
          <div
            key={`${item.label ?? 'item'}-${index}`}
            className="desktop-context-menu__item-wrap"
            onMouseEnter={() => setOpenSubmenuIndex(hasSubmenu ? index : null)}
          >
            <button
              type="button"
              role="menuitem"
              className="desktop-context-menu__item"
              disabled={item.disabled}
              aria-haspopup={hasSubmenu ? 'menu' : undefined}
              aria-expanded={hasSubmenu ? openSubmenuIndex === index : undefined}
              onClick={() => {
                if (item.disabled || hasSubmenu) return;
                item.onClick?.();
                onClose();
              }}
            >
              <span className="desktop-context-menu__icon-slot">
                {item.icon ? <img src={item.icon} alt="" /> : null}
              </span>
              <span className="desktop-context-menu__label">{item.label}</span>
              <span className="desktop-context-menu__arrow" aria-hidden="true">
                {hasSubmenu ? '▶' : ''}
              </span>
            </button>

            {hasSubmenu && openSubmenuIndex === index && (
              <ContextMenuLevel items={item.submenu!} onClose={onClose} isSubmenu />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[10000] desktop-context-menu-anchor"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <ContextMenuLevel items={items} onClose={onClose} />
    </div>
  );
}
