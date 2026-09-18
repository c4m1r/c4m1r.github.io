import { useEffect, useRef, useState } from 'react';
import { Bell, Home, Maximize2, Settings, SlidersHorizontal } from 'lucide-react';

interface IosAssistiveTouchProps {
  enabled: boolean;
  onHome: () => void;
  onOpenSettings: () => void;
  onOpenControlCenter: () => void;
  onOpenNotifications: () => void;
  onToggleFullscreen: () => void;
  onLock: () => void;
}

export function IosAssistiveTouch({
  enabled,
  onHome,
  onOpenSettings,
  onOpenControlCenter,
  onOpenNotifications,
  onToggleFullscreen,
  onLock,
}: IosAssistiveTouchProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const dragging = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    setPosition({
      x: Math.max(12, window.innerWidth - 62),
      y: Math.max(70, window.innerHeight - 190),
    });
  }, [enabled]);

  if (!enabled) return null;

  const beginDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      posX: position.x,
      posY: position.y,
    };
    dragging.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragging.current = true;
    }

    if (!dragging.current) return;

    const minX = 10;
    const minY = 44;
    const maxX = Math.max(minX, window.innerWidth - 58);
    const maxY = Math.max(minY, window.innerHeight - 112);

    setPosition({
      x: Math.max(minX, Math.min(maxX, dragStart.current.posX + dx)),
      y: Math.max(minY, Math.min(maxY, dragStart.current.posY + dy)),
    });
  };

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!dragging.current) {
      setOpen((value) => !value);
    }
  };

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  const actions = [
    { label: 'Home', icon: Home, action: onHome },
    { label: 'Control Center', icon: SlidersHorizontal, action: onOpenControlCenter },
    { label: 'Notifications', icon: Bell, action: onOpenNotifications },
    { label: 'Settings', icon: Settings, action: onOpenSettings },
    { label: 'Fullscreen', icon: Maximize2, action: onToggleFullscreen },
    { label: 'Lock Screen', icon: Home, action: onLock },
  ];

  return (
    <>
      {open && (
        <button
          type="button"
          className="ios-assistive-touch__backdrop"
          aria-label="Close AssistiveTouch"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className="ios-assistive-touch"
        style={{ left: position.x, top: position.y }}
      >
        {actions.map((item, index) => {
          const leftSide = position.x < window.innerWidth / 2;
          const angle = leftSide ? -90 + index * 45 : -90 - index * 45;
          const radians = (angle * Math.PI) / 180;
          const radius = 72;
          const x = open ? 24 + radius * Math.cos(radians) - 22 : 2;
          const y = open ? 24 + radius * Math.sin(radians) - 22 : 2;
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className="ios-assistive-touch__action"
              style={{
                left: x,
                top: y,
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none',
                transform: `scale(${open ? 1 : 0.55})`,
                transitionDelay: `${index * 24}ms`,
              }}
              aria-label={item.label}
              title={item.label}
              onClick={(event) => {
                event.stopPropagation();
                run(item.action);
              }}
            >
              <Icon size={19} strokeWidth={2.1} />
            </button>
          );
        })}

        <button
          type="button"
          className={`ios-assistive-touch__ball ${open ? 'is-open' : ''}`}
          aria-label="AssistiveTouch"
          aria-expanded={open}
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={finishDrag}
          onPointerCancel={() => {
            dragging.current = false;
          }}
        >
          <span><i /></span>
        </button>
      </div>
    </>
  );
}
