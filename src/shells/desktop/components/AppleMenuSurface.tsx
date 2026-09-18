interface AppleMenuSurfaceProps {
  open: boolean;
  onClose: () => void;
  onOpenAbout: () => void;
  onOpenSettings: () => void;
  onLogOut: () => void;
  onShutdown: () => void;
  onForceQuit?: () => void;
  canForceQuit?: boolean;
}

export function AppleMenuSurface({
  open,
  onClose,
  onOpenAbout,
  onOpenSettings,
  onLogOut,
  onShutdown,
  onForceQuit,
  canForceQuit = false,
}: AppleMenuSurfaceProps) {
  if (!open) return null;

  const run = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <div
      className="apple-menu-surface"
      role="dialog"
      aria-label="Apple menu"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="apple-menu-surface__backdrop"
        aria-label="Close Apple menu"
        onClick={onClose}
      />
      <div className="apple-menu-surface__panel" role="menu">
        <button type="button" role="menuitem" onClick={() => run(onOpenAbout)}>
          About This Mac
        </button>
        <div className="apple-menu-surface__separator" />
        <button type="button" role="menuitem" onClick={() => run(onOpenSettings)}>
          System Settings…
        </button>
        <div className="apple-menu-surface__separator" />
        <button type="button" role="menuitem" disabled>
          <span>Recent Items</span>
          <span className="apple-menu-surface__hint">›</span>
        </button>
        <button
          type="button"
          role="menuitem"
          disabled={!canForceQuit || !onForceQuit}
          onClick={() => onForceQuit && run(onForceQuit)}
        >
          <span>Force Quit…</span>
          <span className="apple-menu-surface__hint">⌥⌘⎋</span>
        </button>
        <div className="apple-menu-surface__separator" />
        <button type="button" role="menuitem" onClick={() => run(onLogOut)}>
          Log Out…
        </button>
        <button type="button" role="menuitem" onClick={() => run(onShutdown)}>
          Shut Down…
        </button>
      </div>
    </div>
  );
}
