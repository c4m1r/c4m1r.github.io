import { useCallback, useState } from 'react';

/**
 * Flyouts for flat Start menus (XP and Windows 7 All Programs). A folder row with a submenu opens a
 * panel to its right; the panels stack for deeper folders. The panel component is in
 * StartMenuFlyoutPanel.tsx.
 */

export interface FlyoutItem {
  id: string;
  submenu?: FlyoutItem[];
}

export interface FlyoutLevel<T> {
  items: T[];
  top: number;
  left: number;
}

export function useFlyoutChain<T extends FlyoutItem>() {
  const [chain, setChain] = useState<FlyoutLevel<T>[]>([]);

  /** Hovering a row at `depth` (0 for the root list) replaces the panels from that depth on. */
  const hover = useCallback((depth: number, item: T, rect: DOMRect) => {
    setChain((prev) => {
      const base = prev.slice(0, depth);
      if (!item.submenu) return base;
      return [...base, { items: item.submenu, top: rect.top, left: rect.right }];
    });
  }, []);

  const reset = useCallback(() => setChain([]), []);

  return { chain, hover, reset };
}

