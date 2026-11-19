import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent } from 'react';

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
const STEP = 12;
const STORAGE_PREFIX = 'desktop-widget-layout-v3:';

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
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const itemIds = items.map((item) => item.id).join('|');
  const layoutSignature = items.map((item) => `${item.id}:${item.defaultPreset}:${item.presets.map((preset) => `${preset.id}-${preset.width}x${preset.height}`).join(',')}`).join('|');
  const [placements, setPlacements] = useState<Record<string, Placement>>(() => readPlacements(storageKey));
  const [expandedControls, setExpandedControls] = useState<Record<string, boolean>>({});
  const activeStorageKeyRef = useRef(storageKey);
  const skipNextPersistRef = useRef(false);

  useEffect(() => {
    if (activeStorageKeyRef.current === storageKey) return;
    activeStorageKeyRef.current = storageKey;
    skipNextPersistRef.current = true;
    setPlacements(readPlacements(storageKey));
  }, [storageKey]);

  const getPreset = useCallback((item: DesktopWidgetItem, placement?: Placement) => (
    item.presets.find((preset) => preset.id === placement?.preset) ??
    item.presets.find((preset) => preset.id === item.defaultPreset) ?? item.presets[0]
  ), []);

  const getSize = useCallback((item: DesktopWidgetItem, placement: Placement, bounds: DOMRect) => {
    const preset = getPreset(item, placement);
    return { width: Math.min(preset.width, bounds.width), height: Math.min(preset.height, bounds.height) };
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

  const getPlacementBounds = useCallback((bounds: DOMRect, current: Record<string, Placement>) => {
    if (themeKey !== 'webos') return bounds;
    const layoutItems = itemsRef.current;
    const baseWidth = Math.min(...layoutItems.map((item) => item.presets.find((preset) => preset.id === 'compact')?.width ?? item.presets[0]?.width ?? 260));
    const columns = bounds.width >= 2 * (baseWidth + GAP) + 24 ? 2 : 1;
    const maxHeight = Math.max(140, ...layoutItems.map((item) => getPreset(item, current[item.id])?.height ?? 140));
    const savedBottom = Math.max(0, ...layoutItems.map((item) => {
      const placement = current[item.id];
      const preset = getPreset(item, placement);
      return placement && preset ? placement.y + preset.height : 0;
    }));
    const rows = Math.ceil(layoutItems.length / columns);
    const height = Math.max(bounds.height, rows * (maxHeight + GAP) + 16, savedBottom + 16);
    return height === bounds.height ? bounds : ({ ...bounds, height } as DOMRect);
  }, [getPreset, themeKey]);

  const normalizePlacements = useCallback((current: Record<string, Placement>, bounds: DOMRect) => {
    const next: Record<string, Placement> = {};
    const occupied: Rect[] = [];
    const layoutBounds = getPlacementBounds(bounds, current);
    const layoutItems = itemsRef.current;
    const ordered = [...layoutItems].sort((a, b) => {
      const pa = current[a.id]; const pb = current[b.id];
      if (Boolean(pa) !== Boolean(pb)) return pa ? -1 : 1;
      return (pa?.y ?? 0) - (pb?.y ?? 0) || (pa?.x ?? 0) - (pb?.x ?? 0);
    });
    const baseWidth = Math.min(...layoutItems.map((item) => {
      const compact = item.presets.find((option) => option.id === 'compact');
      return compact?.width ?? item.presets[0]?.width ?? 260;
    }));
    const columnCount = themeKey === 'webos' ? (bounds.width >= 2 * (baseWidth + GAP) + 24 ? 2 : 1) : Math.max(1, Math.min(4, Math.floor((bounds.width - 24 + GAP) / (baseWidth + GAP))));
    const columnWidth = (bounds.width - 24) / columnCount;
    const columnBottoms = Array.from({ length: columnCount }, () => 8);
    ordered.forEach((item) => {
      const saved = current[item.id];
      let preset = getPreset(item, saved);
      if (!preset) return;
      if (!saved && (themeKey === 'webos' || bounds.width < 760 || layoutItems.length > 7)) {
        preset = item.presets.find((option) => option.id === 'compact') ?? preset;
      }
      if (preset.width > bounds.width || preset.height > layoutBounds.height) {
        const compact = item.presets.find((option) => option.id === 'compact');
        if (compact && compact.width <= bounds.width && compact.height <= layoutBounds.height) preset = compact;
      }
      let placement: Placement;
      if (saved) {
        placement = saved;
        const column = Math.max(0, Math.min(columnCount - 1, Math.floor(Math.max(0, saved.x - 12) / columnWidth)));
        columnBottoms[column] = Math.max(columnBottoms[column], saved.y + preset.height + GAP);
      } else {
        const column = columnBottoms.indexOf(Math.min(...columnBottoms));
        const preferredX = themeKey === 'webos' ? bounds.width - 8 - (columnCount - column - 1) * (baseWidth + GAP) - preset.width : 12 + column * columnWidth;
        placement = {
          x: Math.max(0, Math.min(preferredX, bounds.width - preset.width)),
          y: columnBottoms[column],
          preset: preset.id,
        };
        columnBottoms[column] += preset.height + GAP;
      }
      const size = getSize(item, placement, layoutBounds);
      const position = findFreePosition(placement, size, layoutBounds, occupied);
      // Never force a widget into an occupied rectangle when the desktop is full.
      if (!position) return;
      next[item.id] = { ...placement, ...position, preset: preset.id };
      occupied.push({ ...position, ...size });
    });
    return next;
  }, [findFreePosition, getPlacementBounds, getPreset, getSize, themeKey]);

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
  }, [itemIds, layoutSignature, normalizePlacements]);

  useEffect(() => {
    // A theme switch first restores that OS's own layout. Do not overwrite it
    // with the previous OS's positions during the same render cycle.
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(placements));
      window.dispatchEvent(new CustomEvent('desktop-widget-layout-updated', { detail: { themeKey } }));
    } catch { /* storage may be unavailable */ }
  }, [placements, storageKey, themeKey]);

  const clampAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    setPlacements((current) => {
      const normalized = normalizePlacements(current, bounds);
      const same = Object.keys(current).length === Object.keys(normalized).length &&
        Object.entries(normalized).every(([id, value]) => current[id]?.x === value.x && current[id]?.y === value.y && current[id]?.preset === value.preset);
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
    const layoutBounds = getPlacementBounds(bounds, placements);
    const size = getSize(item, placement, layoutBounds);
    let x = Math.max(0, Math.min(drag.originX + event.clientX - drag.startX, layoutBounds.width - size.width));
    let y = Math.max(0, Math.min(drag.originY + event.clientY - drag.startY, layoutBounds.height - size.height));
    if (x < SNAP) x = 0;
    if (y < SNAP) y = 0;
    if (bounds.width - x - size.width < SNAP) x = bounds.width - size.width;
    if (layoutBounds.height - y - size.height < SNAP) y = layoutBounds.height - size.height;
    const candidate = { x, y, ...size };
    const collision = items.some((other) => {
      if (other.id === drag.id || !placements[other.id]) return false;
      const otherSize = getSize(other, placements[other.id], layoutBounds);
      return intersects(candidate, { ...placements[other.id], ...otherSize });
    });
    if (!collision) setPlacements((current) => ({ ...current, [drag.id]: { ...current[drag.id], x, y } }));
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      const bounds = canvas.getBoundingClientRect();
      setPlacements((current) => normalizePlacements(current, bounds));
    }
  };

  const changePreset = useCallback((item: DesktopWidgetItem, presetId: string) => {
    if (!item.presets.some((preset) => preset.id === presetId)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    setPlacements((current) => {
      const previous = current[item.id] ?? { x: 8, y: 8, preset: item.defaultPreset };
      const proposed = { ...previous, preset: presetId };
      const layoutBounds = getPlacementBounds(bounds, current);
      const size = getSize(item, proposed, layoutBounds);
      const occupied = itemsRef.current.flatMap((other) => {
        if (other.id === item.id || !current[other.id]) return [];
        return [{ ...current[other.id], ...getSize(other, current[other.id], layoutBounds) }];
      });
      const position = findFreePosition(previous, size, layoutBounds, occupied);
      if (!position) return current;
      const updated = { ...current, [item.id]: { ...proposed, ...position } };
      return normalizePlacements(updated, bounds);
    });
  }, [findFreePosition, getPlacementBounds, getSize, normalizePlacements]);

  useEffect(() => {
    const handlePresetRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ widgetId: string; presetId: string }>).detail;
      if (!detail) return;
      const item = itemsRef.current.find((entry) => entry.id === detail.widgetId);
      if (item) changePreset(item, detail.presetId);
    };
    window.addEventListener('desktop-widget-preset-change', handlePresetRequest);
    return () => window.removeEventListener('desktop-widget-preset-change', handlePresetRequest);
  }, [changePreset]);

  return (
    <div ref={canvasRef} className="desktop-widget-canvas" data-theme-key={themeKey} aria-label="Desktop widgets">
      {items.map((item) => {
        const placement = placements[item.id];
        if (!placement) return null;
        const preset = getPreset(item, placement);
        if (!preset) return null;
        const canvasBounds = canvasRef.current?.getBoundingClientRect();
        const width = Math.min(preset.width, canvasBounds?.width ?? preset.width);
        // Match the dimensions used by placement normalization on fixed-height desktop canvases.
        // WebOS intentionally grows vertically and scrolls, so its widget height remains unconstrained.
        const height = themeKey === 'webos' ? preset.height : Math.min(preset.height, canvasBounds?.height ?? preset.height);
        return (
          <section key={item.id} data-widget-id={item.id} className="desktop-widget-canvas__item" style={{ left: placement.x, top: placement.y, width, height }}>
            <div className={`desktop-widget-canvas__handle${expandedControls[item.id] ? ' is-expanded' : ''}`} role="group" aria-label={`Move ${item.title}`} tabIndex={0}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
                event.preventDefault();
                const delta = event.shiftKey ? 48 : 12;
                const dx = event.key === 'ArrowLeft' ? -delta : event.key === 'ArrowRight' ? delta : 0;
                const dy = event.key === 'ArrowUp' ? -delta : event.key === 'ArrowDown' ? delta : 0;
                const bounds = canvasRef.current?.getBoundingClientRect();
                if (!bounds) return;
                const layoutBounds = getPlacementBounds(bounds, placements);
                const nextX = Math.max(0, Math.min(placement.x + dx, layoutBounds.width - width));
                const nextY = Math.max(0, Math.min(placement.y + dy, layoutBounds.height - height));
                const candidate = { x: nextX, y: nextY, width, height };
                const blocked = items.some((other) => {
                  if (other.id === item.id || !placements[other.id]) return false;
                  return intersects(candidate, { ...placements[other.id], ...getSize(other, placements[other.id], layoutBounds) });
                });
                if (!blocked) setPlacements((current) => ({ ...current, [item.id]: { ...current[item.id], x: nextX, y: nextY } }));
              }}
              onPointerDown={(event) => {
                if ((event.target as HTMLElement).closest('select')) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                dragRef.current = { id: item.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: placement.x, originY: placement.y };
              }}
              onPointerMove={moveWidget} onPointerUp={endDrag} onPointerCancel={endDrag}>
              <button type="button" className="desktop-widget-canvas__grip" aria-label={`${expandedControls[item.id] ? 'Hide' : 'Show'} ${item.title} controls`} aria-expanded={Boolean(expandedControls[item.id])} onClick={() => setExpandedControls((current) => ({ ...current, [item.id]: !current[item.id] }))}>⠿</button>
              {expandedControls[item.id] && <><span className="desktop-widget-canvas__title">{item.title}</span>
              <select aria-label={item.title + ' size'} value={preset.id} onChange={(event) => changePreset(item, event.target.value)} onPointerDown={(event) => event.stopPropagation()}>
                {item.presets.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select></>}
            </div>
            <div className="desktop-widget-canvas__content">{item.content}</div>
          </section>
        );
      })}
    </div>
  );
}
