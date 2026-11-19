import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type PointerEvent } from 'react';

export interface DesktopWidgetPreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface DesktopWidgetItem {
  id: string;
  title: string;
  content: ReactNode;
  presets: DesktopWidgetPreset[];
  defaultPreset: string;
}

interface Placement {
  x: number;
  y: number;
  preset: string;
}

interface DesktopWidgetCanvasProps {
  themeKey: string;
  items: DesktopWidgetItem[];
}

const GAP = 10;
const SNAP = 18;
const STORAGE_PREFIX = 'desktop-widget-layout-v2:';

function intersects(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function DesktopWidgetCanvas({ themeKey, items }: DesktopWidgetCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const storageKey = STORAGE_PREFIX + themeKey;
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const [placements, setPlacements] = useState<Record<string, Placement>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) as Record<string, Placement> : {};
    } catch { return {}; }
  });

  useEffect(() => {
    setPlacements((current) => {
      const next = { ...current };
      items.forEach((item, index) => {
        if (!next[item.id]) {
          const preset = item.presets.find((entry) => entry.id === item.defaultPreset) ?? item.presets[0];
          next[item.id] = { x: 12 + (index % 2) * 310, y: 12 + Math.floor(index / 2) * 230, preset: preset.id };
        }
      });
      Object.keys(next).forEach((id) => { if (!itemIds.includes(id)) delete next[id]; });
      return next;
    });
  // item identity is intentionally keyed by its stable IDs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIds.join('|')]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(placements)); } catch { /* storage can be unavailable */ }
  }, [placements, storageKey]);

  const getPreset = useCallback((item: DesktopWidgetItem, placement?: Placement) => {
    return item.presets.find((preset) => preset.id === placement?.preset)
      ?? item.presets.find((preset) => preset.id === item.defaultPreset)
      ?? item.presets[0];
  }, []);

  const clampAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    setPlacements((current) => {
      const next = { ...current };
      const placed: Array<{ x: number; y: number; width: number; height: number }> = [];
      items.forEach((item) => {
        const position = next[item.id];
        if (!position) return;
        const preset = getPreset(item, position);
        const width = Math.min(preset.width, Math.max(160, bounds.width));
        const height = Math.min(preset.height + 28, Math.max(100, bounds.height));
        let x = Math.max(0, Math.min(position.x, bounds.width - width));
        let y = Math.max(0, Math.min(position.y, bounds.height - height));
        let candidate = { x, y, width, height };
        if (placed.some((other) => intersects(candidate, other))) {
          x = 8; y = 8;
          candidate = { x, y, width, height };
          while (placed.some((other) => intersects(candidate, other)) && y + height < bounds.height) {
            y += height + GAP;
            candidate = { x, y, width, height };
          }
        }
        next[item.id] = { ...position, x, y };
        placed.push(candidate);
      });
      return next;
    });
  }, [getPreset, items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => clampAll());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [clampAll]);

  const moveWidget = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas || drag.pointerId !== event.pointerId) return;
    const item = items.find((entry) => entry.id === drag.id);
    const placement = placements[drag.id];
    if (!item || !placement) return;
    const preset = getPreset(item, placement);
    const bounds = canvas.getBoundingClientRect();
    const width = Math.min(preset.width, bounds.width);
    const height = Math.min(preset.height + 28, bounds.height);
    let x = Math.max(0, Math.min(drag.originX + event.clientX - drag.startX, bounds.width - width));
    let y = Math.max(0, Math.min(drag.originY + event.clientY - drag.startY, bounds.height - height));
    if (x < SNAP) x = 0;
    if (y < SNAP) y = 0;
    if (bounds.width - (x + width) < SNAP) x = bounds.width - width;
    if (bounds.height - (y + height) < SNAP) y = bounds.height - height;
    const candidate = { x, y, width, height };
    const collision = items.some((other) => {
      if (other.id === drag.id) return false;
      const otherPlacement = placements[other.id];
      if (!otherPlacement) return false;
      const otherPreset = getPreset(other, otherPlacement);
      return intersects(candidate, { x: otherPlacement.x, y: otherPlacement.y, width: Math.min(otherPreset.width, bounds.width), height: Math.min(otherPreset.height + 28, bounds.height) });
    });
    if (!collision) setPlacements((current) => ({ ...current, [drag.id]: { ...current[drag.id], x, y } }));
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const changePreset = useCallback((item: DesktopWidgetItem, presetId: string) => {
    const preset = item.presets.find((entry) => entry.id === presetId);
    if (!preset) return;
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    setPlacements((current) => {
      const previous = current[item.id] ?? { x: 8, y: 8, preset: presetId };
      let x = bounds ? Math.min(previous.x, Math.max(0, bounds.width - preset.width)) : previous.x;
      let y = bounds ? Math.min(previous.y, Math.max(0, bounds.height - preset.height - 28)) : previous.y;
      const candidate = { x, y, width: preset.width, height: preset.height + 28 };
      const collision = items.some((other) => {
        if (other.id === item.id || !current[other.id]) return false;
        const otherPreset = getPreset(other, current[other.id]);
        return intersects(candidate, { x: current[other.id].x, y: current[other.id].y, width: otherPreset.width, height: otherPreset.height + 28 });
      });
      if (collision) return current;
      return { ...current, [item.id]: { x, y, preset: presetId } };
    });
  }, [getPreset, items]);

  useEffect(() => {
    const handlePresetRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ widgetId: string; presetId: string }>).detail;
      if (!detail) return;
      const target = items.find((item) => item.id === detail.widgetId);
      if (target) changePreset(target, detail.presetId);
    };
    window.addEventListener('desktop-widget-preset-change', handlePresetRequest);
    return () => window.removeEventListener('desktop-widget-preset-change', handlePresetRequest);
  }, [changePreset]);
  return (
    <div ref={canvasRef} className="desktop-widget-canvas" aria-label="Desktop widgets">
      {items.map((item) => {
        const placement = placements[item.id];
        if (!placement) return null;
        const preset = getPreset(item, placement);
        return (
          <section key={item.id} className="desktop-widget-canvas__item" style={{ left: placement.x, top: placement.y, width: preset.width, height: preset.height + 28 }}>
            <div
              className="desktop-widget-canvas__handle"
              onPointerDown={(event) => {
                if ((event.target as HTMLElement).closest('select,button')) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                dragRef.current = { id: item.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: placement.x, originY: placement.y };
              }}
              onPointerMove={moveWidget}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <span className="desktop-widget-canvas__grip" aria-hidden="true">⠿</span>
              <span className="desktop-widget-canvas__title">{item.title}</span>
              <select aria-label={item.title + ' size'} value={preset.id} onChange={(event) => changePreset(item, event.target.value)} onPointerDown={(event) => event.stopPropagation()}>
                {item.presets.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </div>
            <div className="desktop-widget-canvas__content">{item.content}</div>
          </section>
        );
      })}
    </div>
  );
}
