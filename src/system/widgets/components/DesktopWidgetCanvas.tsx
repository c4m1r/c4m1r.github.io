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

interface Placement { x: number; y: number; preset: string; }
interface Rect { x: number; y: number; width: number; height: number; }
interface DesktopWidgetCanvasProps { themeKey: string; items: DesktopWidgetItem[]; }

const GAP = 10;
const SNAP = 18;
const HANDLE_HEIGHT = 28;
const STEP = 12;
const STORAGE_PREFIX = 'desktop-widget-layout-v2:';

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width + GAP &&
    a.x + a.width + GAP > b.x &&
    a.y < b.y + b.height + GAP &&
    a.y + a.height + GAP > b.y;
}

function readPlacements(key: string): Record<string, Placement> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const stored = JSON.parse(raw) as Record<string, Partial<Placement>>;
    return Object.fromEntries(Object.entries(stored).flatMap(([id, value]) => {
      if (!value || !Number.isFinite(value.x) || !Number.isFinite(value.y) || typeof value.preset !== 'string') return [];
      return [[id, { x: Math.max(0, value.x as number), y: Math.max(0, value.y as number), preset: value.preset }]];
    }));
  } catch { return {}; }
}

export function DesktopWidgetCanvas({ themeKey, items }: DesktopWidgetCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const storageKey = STORAGE_PREFIX + themeKey;
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const [placements, setPlacements] = useState<Record<string, Placement>>(() => readPlacements(storageKey));

  const getPreset = useCallback((item: DesktopWidgetItem, placement?: Placement) => (
    item.presets.find((preset) => preset.id === placement?.preset) ??
    item.presets.find((preset) => preset.id === item.defaultPreset) ?? item.presets[0]
  ), []);

  const getSize = useCallback((item: DesktopWidgetItem, placement: Placement, bounds: DOMRect) => {
    const preset = getPreset(item, placement);
    return { width: Math.min(preset.width, bounds.width), height: Math.min(preset.height + HANDLE_HEIGHT, bounds.height) };
  }, [getPreset]);

  const findFreePosition = useCallback((preferred: { x: number; y: number }, size: { width: number; height: number }, bounds: DOMRect, occupied: Rect[]) => {
    const maxX = Math.max(0, bounds.width - size.width);
    const maxY = Math.max(0, bounds.height - size.height);
    const baseX = Math.max(0, Math.min(preferred.x, maxX));
    const baseY = Math.max(0, Math.min(preferred.y, maxY));
    const free = (x: number, y: number) => !occupied.some((other) => intersects({ x, y, ...size }, other));
    if (free(baseX, baseY)) return { x: baseX, y: baseY };

    const maxRing = Math.min(500, Math.ceil(maxX / STEP) + Math.ceil(maxY / STEP));
    for (let ring = 1; ring <= maxRing; ring++) {
      let best: { x: number; y: number; distance: number } | null = null;
      for (let dy = -ring; dy <= ring; dy++) {
        const dx = ring - Math.abs(dy);
        for (const signedDx of dx === 0 ? [0] : [-dx, dx]) {
          const x = Math.max(0, Math.min(baseX + signedDx * STEP, maxX));
          const y = Math.max(0, Math.min(baseY + dy * STEP, maxY));
          if (!free(x, y)) continue;
          const distance = Math.hypot(x - baseX, y - baseY);
          if (!best || distance < best.distance) best = { x, y, distance };
        }
      }
      if (best) return { x: best.x, y: best.y };
    }
    return null;
  }, []);

  const normalizePlacements = useCallback((current: Record<string, Placement>, bounds: DOMRect) => {
    const next: Record<string, Placement> = {};
    const occupied: Rect[] = [];
    const ordered = [...items].sort((a, b) => {
      const pa = current[a.id]; const pb = current[b.id];
      return (pa?.y ?? 0) - (pb?.y ?? 0) || (pa?.x ?? 0) - (pb?.x ?? 0);
    });
    ordered.forEach((item, index) => {
      const saved = current[item.id];
      const preset = getPreset(item, saved);
      if (!preset) return;
      const placement = saved ?? { x: 12 + (index % 2) * 300, y: 12 + Math.floor(index / 2) * 220, preset: preset.id };
      const size = getSize(item, placement, bounds);
      const position = findFreePosition(placement, size, bounds, occupied);
      const safePosition = position ?? { x: Math.max(0, Math.min(placement.x, bounds.width - size.width)), y: Math.max(0, Math.min(placement.y, bounds.height - size.height)) };
      next[item.id] = { ...placement, ...safePosition, preset: preset.id };
      occupied.push({ ...safePosition, ...size });
    });
    return next;
  }, [findFreePosition, getPreset, getSize, items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPlacements((current) => {
      const normalized = normalizePlacements(current, canvas.getBoundingClientRect());
      const same = Object.keys(current).length === Object.keys(normalized).length &&
        Object.entries(normalized).every(([id, value]) => current[id]?.x === value.x && current[id]?.y === value.y && current[id]?.preset === value.preset);
      return same ? current : normalized;
    });
  // IDs, not freshly-created ReactNode props, determine the widget set.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIds.join('|'), normalizePlacements]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(placements)); } catch { /* storage may be unavailable */ }
  }, [placements, storageKey]);

  const clampAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    setPlacements((current) => {
      const normalized = normalizePlacements(current, bounds);
      const same = Object.keys(current).length === Object.keys(normalized).length &&
        Object.entries(normalized).every(([id, value]) => current[id]?.x === value.x && current[id]?.y === value.y);
      return same ? current : normalized;
    });
  }, [normalizePlacements]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(clampAll);
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
    const bounds = canvas.getBoundingClientRect();
    const size = getSize(item, placement, bounds);
    let x = Math.max(0, Math.min(drag.originX + event.clientX - drag.startX, bounds.width - size.width));
    let y = Math.max(0, Math.min(drag.originY + event.clientY - drag.startY, bounds.height - size.height));
    if (x < SNAP) x = 0;
    if (y < SNAP) y = 0;
    if (bounds.width - x - size.width < SNAP) x = bounds.width - size.width;
    if (bounds.height - y - size.height < SNAP) y = bounds.height - size.height;
    const candidate = { x, y, ...size };
    const collision = items.some((other) => {
      if (other.id === drag.id || !placements[other.id]) return false;
      const otherSize = getSize(other, placements[other.id], bounds);
      return intersects(candidate, { ...placements[other.id], ...otherSize });
    });
    if (!collision) setPlacements((current) => ({ ...current, [drag.id]: { ...current[drag.id], x, y } }));
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const changePreset = useCallback((item: DesktopWidgetItem, presetId: string) => {
    if (!item.presets.some((preset) => preset.id === presetId)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    setPlacements((current) => {
      const previous = current[item.id] ?? { x: 8, y: 8, preset: item.defaultPreset };
      const proposed = { ...previous, preset: presetId };
      const size = getSize(item, proposed, bounds);
      const occupied = items.flatMap((other) => {
        if (other.id === item.id || !current[other.id]) return [];
        return [{ ...current[other.id], ...getSize(other, current[other.id], bounds) }];
      });
      const position = findFreePosition(previous, size, bounds, occupied);
      if (!position) return current;
      return { ...current, [item.id]: { ...proposed, ...position } };
    });
  }, [findFreePosition, getSize, items]);

  useEffect(() => {
    const handlePresetRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ widgetId: string; presetId: string }>).detail;
      if (!detail) return;
      const item = items.find((entry) => entry.id === detail.widgetId);
      if (item) changePreset(item, detail.presetId);
    };
    window.addEventListener('desktop-widget-preset-change', handlePresetRequest);
    return () => window.removeEventListener('desktop-widget-preset-change', handlePresetRequest);
  }, [changePreset, items]);

  return (
    <div ref={canvasRef} className="desktop-widget-canvas" aria-label="Desktop widgets">
      {items.map((item) => {
        const placement = placements[item.id];
        if (!placement) return null;
        const preset = getPreset(item, placement);
        if (!preset) return null;
        const width = Math.min(preset.width, canvasRef.current?.clientWidth ?? preset.width);
        const height = Math.min(preset.height + HANDLE_HEIGHT, canvasRef.current?.clientHeight ?? preset.height + HANDLE_HEIGHT);
        return (
          <section key={item.id} className="desktop-widget-canvas__item" style={{ left: placement.x, top: placement.y, width, height }}>
            <div className="desktop-widget-canvas__handle"
              onPointerDown={(event) => {
                if ((event.target as HTMLElement).closest('select,button')) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                dragRef.current = { id: item.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: placement.x, originY: placement.y };
              }}
              onPointerMove={moveWidget} onPointerUp={endDrag} onPointerCancel={endDrag}>
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
