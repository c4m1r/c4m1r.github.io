import { useEffect, useRef } from 'react';
import { useApp } from '../../../contexts/useApp';
import { win8Text } from '../../../i18n/win8Strings';
import '../../../styles/os/themes/win81-power-menu.css';

export type Win81PowerAction = 'control-panel' | 'task-manager' | 'run' | 'logoff' | 'shutdown';

export interface Win81PowerMenuProps {
  /** Left edge and top edge of the menu, in viewport pixels. */
  x: number;
  y: number;
  onAction: (action: Win81PowerAction) => void;
  onClose: () => void;
}

/**
 * Windows 8.1 power-user menu: the plain text list of system tools that opens from the Start button's
 * right click and from Win+X. It is the one addition over Windows 8, which had no such menu.
 */
export function Win81PowerMenu({ x, y, onAction, onClose }: Win81PowerMenuProps) {
  const { language } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  type MenuRow = { kind: 'item'; action: Win81PowerAction; label: string } | { kind: 'separator' };
  const items: MenuRow[] = [
    { kind: 'item', action: 'control-panel', label: win8Text(language, 'controlPanel') },
    { kind: 'item', action: 'task-manager', label: win8Text(language, 'taskManager') },
    { kind: 'item', action: 'run', label: win8Text(language, 'run') },
    { kind: 'separator' },
    { kind: 'item', action: 'shutdown', label: win8Text(language, 'shutDown') },
    { kind: 'item', action: 'logoff', label: win8Text(language, 'logOff') },
  ];

  return (
    <div
      ref={ref}
      className="win81-power-menu"
      role="menu"
      style={{ left: x, top: y }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {items.map((item, index) =>
        item.kind === 'separator' ? (
          <div key={`sep-${index}`} className="win81-power-menu__separator" role="separator" />
        ) : (
          <button
            key={item.action}
            type="button"
            role="menuitem"
            className="win81-power-menu__item"
            onClick={() => onAction(item.action)}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
