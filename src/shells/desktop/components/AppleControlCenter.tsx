interface AppleControlCenterProps {
  open: boolean;
  volumeLevel: number;
  isFullscreen: boolean;
  onClose: () => void;
  onVolumeLevelChange: (value: number) => void;
  onFullscreenToggle: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export function AppleControlCenter({
  open,
  volumeLevel,
  isFullscreen,
  onClose,
  onVolumeLevelChange,
  onFullscreenToggle,
  onOpenSettings,
  onOpenAbout,
}: AppleControlCenterProps) {
  if (!open) return null;

  return (
    <div
      className="apple-control-center"
      role="dialog"
      aria-label="Control Center"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="apple-control-center__backdrop"
        aria-label="Close Control Center"
        onClick={onClose}
      />
      <div className="apple-control-center__panel">
        <div className="apple-control-center__connectivity">
          <button type="button" className="apple-control-center__tile is-active">
            <span className="apple-control-center__tile-icon">⌁</span>
            <span>
              <strong>Wi-Fi</strong>
              <small>Connected</small>
            </span>
          </button>
          <button type="button" className="apple-control-center__tile is-active">
            <span className="apple-control-center__tile-icon">ᛒ</span>
            <span>
              <strong>Bluetooth</strong>
              <small>On</small>
            </span>
          </button>
        </div>

        <div className="apple-control-center__slider-card">
          <div className="apple-control-center__slider-label">
            <span>Volume</span>
            <strong>{volumeLevel}%</strong>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volumeLevel}
            aria-label="Volume"
            onChange={(event) => onVolumeLevelChange(Number(event.target.value))}
          />
        </div>

        <div className="apple-control-center__actions">
          <button type="button" onClick={onFullscreenToggle}>
            <span>{isFullscreen ? '↙' : '↗'}</span>
            <small>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</small>
          </button>
          <button type="button" onClick={onOpenSettings}>
            <span>⚙</span>
            <small>System Settings</small>
          </button>
          <button type="button" onClick={onOpenAbout}>
            <span>i</span>
            <small>About</small>
          </button>
        </div>
      </div>
    </div>
  );
}
