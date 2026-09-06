import { useCallback, useEffect, useRef, useState } from 'react';
import type { DesktopIcon, DesktopSelectionBox as DesktopSelectionBoxData } from '../desktopTypes';
import { createSelectionBox } from './windowGeometry';
import { getRelativeRect, isIconInsideSelectionBox } from './iconHitTesting';

export interface UseDesktopIconGridStateOptions {
  initialDesktopIcons: DesktopIcon[];
  viewport: { width: number; height: number };
  desktopRef: React.RefObject<HTMLDivElement | null>;
  iconRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onCloseStartMenu?: () => void;
}

export interface UseDesktopIconGridStateReturn {
  desktopIcons: DesktopIcon[];
  selectedIcons: string[];
  setSelectedIcons: React.Dispatch<React.SetStateAction<string[]>>;
  draggingIcon: string | null;
  selectionBox: DesktopSelectionBoxData | null;
  handleDesktopMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleIconMouseDown: (e: React.MouseEvent, iconId: string) => void;
  clearSelection: () => void;
}

export function useDesktopIconGridState(
  options: UseDesktopIconGridStateOptions
): UseDesktopIconGridStateReturn {
  const { initialDesktopIcons, viewport, desktopRef, iconRefs, onCloseStartMenu } = options;

  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingIcon, setDraggingIcon] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<DesktopSelectionBoxData | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);

  const taskbarHeight = 30;
  const iconSpacingY = 100;
  const iconSpacingX = 110;
  const baseOffsetX = 40;
  const baseOffsetY = 40;
  const availableHeight = Math.max(
    iconSpacingY,
    viewport.height - taskbarHeight - baseOffsetY * 2
  );
  const iconsPerColumn = Math.max(1, Math.floor(availableHeight / iconSpacingY));

  const desktopIcons: DesktopIcon[] = initialDesktopIcons.map((icon, index) => {
    const savedPosition = iconPositions[icon.id];
    if (savedPosition) {
      return { ...icon, x: savedPosition.x, y: savedPosition.y };
    }

    const columnIndex = Math.floor(index / iconsPerColumn);
    const rowIndex = index % iconsPerColumn;
    return {
      ...icon,
      x: baseOffsetX + columnIndex * iconSpacingX,
      y: baseOffsetY + rowIndex * iconSpacingY,
    };
  });

  if (!iconPositions['recycle-bin']) {
    const recycleIcon = desktopIcons.find((icon) => icon.id === 'recycle-bin');
    if (recycleIcon) {
      recycleIcon.x = Math.max(baseOffsetX, viewport.width - baseOffsetX - 72);
      recycleIcon.y = Math.max(baseOffsetY, viewport.height - taskbarHeight - baseOffsetY - 72);
    }
  }

  const updateSelectionFromBox = useCallback(
    (box: { left: number; top: number; width: number; height: number }) => {
      if (!desktopRef.current) return;
      const desktopRect = desktopRef.current.getBoundingClientRect();

      const newlySelected: string[] = [];

      desktopIcons.forEach((icon) => {
        const node = iconRefs.current[icon.id];
        if (!node) return;
        const iconRect = getRelativeRect(node.getBoundingClientRect(), desktopRect);

        if (isIconInsideSelectionBox(iconRect, box)) {
          newlySelected.push(icon.id);
        }
      });

      setSelectedIcons((prev) => {
        if (prev.length === newlySelected.length && prev.every((id) => newlySelected.includes(id))) {
          return prev;
        }
        return newlySelected;
      });
    },
    [desktopIcons, desktopRef, iconRefs]
  );

  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!desktopRef.current) return;
      const desktopRect = desktopRef.current.getBoundingClientRect();
      const currentX = event.clientX - desktopRect.left;
      const currentY = event.clientY - desktopRect.top;
      const startPoint = selectionStartRef.current!;
      const box = createSelectionBox(startPoint, { x: currentX, y: currentY });
      setSelectionBox(box);
      updateSelectionFromBox(box);
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
      setSelectionBox(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [desktopRef, isSelecting, updateSelectionFromBox]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingIcon || !desktopRef.current) return;

      const desktopRect = desktopRef.current.getBoundingClientRect();
      const newX = e.clientX - desktopRect.left - dragOffset.x;
      const newY = e.clientY - desktopRect.top - dragOffset.y;

      setIconPositions((prev) => ({
        ...prev,
        [draggingIcon]: {
          x: Math.max(0, Math.min(newX, desktopRect.width - 100)),
          y: Math.max(0, Math.min(newY, desktopRect.height - 100)),
        },
      }));
    };

    const handleMouseUp = () => {
      setDraggingIcon(null);
    };

    if (draggingIcon) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [desktopRef, dragOffset, draggingIcon]);

  const handleDesktopMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (!desktopRef.current) return;

    onCloseStartMenu?.();
    if (event.target === desktopRef.current) {
      const desktopRect = desktopRef.current.getBoundingClientRect();
      const startX = event.clientX - desktopRect.left;
      const startY = event.clientY - desktopRect.top;
      selectionStartRef.current = { x: startX, y: startY };
      setIsSelecting(true);
      setSelectionBox({ left: startX, top: startY, width: 0, height: 0 });
      setSelectedIcons([]);
    }
  };

  const handleIconMouseDown = (e: React.MouseEvent, iconId: string) => {
    e.preventDefault();
    const icon = desktopIcons.find((i) => i.id === iconId);
    if (!icon || icon.x === undefined || icon.y === undefined) return;

    if (e.button === 0) {
      if (e.ctrlKey) {
        setSelectedIcons((prev) => {
          if (prev.includes(iconId)) {
            return prev.filter((id) => id !== iconId);
          }
          return [...prev, iconId];
        });
      } else if (!selectedIcons.includes(iconId)) {
        setSelectedIcons([iconId]);
      }
    } else if (!selectedIcons.includes(iconId)) {
      setSelectedIcons((prev) => {
        if (prev.includes(iconId)) {
          return prev.filter((id) => id !== iconId);
        }
        return [...prev, iconId];
      });
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDraggingIcon(iconId);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const clearSelection = useCallback(() => {
    setSelectedIcons([]);
  }, []);

  return {
    desktopIcons,
    selectedIcons,
    setSelectedIcons,
    draggingIcon,
    selectionBox,
    handleDesktopMouseDown,
    handleIconMouseDown,
    clearSelection,
  };
}
