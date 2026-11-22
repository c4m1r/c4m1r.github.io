import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { FlyoutItem, FlyoutLevel } from './startMenuFlyout';

/** Fixed panel that sits beside its row. `className` carries the menu's own look. */
export function FlyoutPanel({ level, className, children }: { level: FlyoutLevel<FlyoutItem>; className: string; children: ReactNode }) {
  // Portal: an ancestor with a transform (the slide-in animation) would otherwise become the
  // containing block of the fixed panel.
  return createPortal(
    <div
      className={className}
      style={{ position: 'fixed', top: level.top, left: level.left, zIndex: 100002 }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}
