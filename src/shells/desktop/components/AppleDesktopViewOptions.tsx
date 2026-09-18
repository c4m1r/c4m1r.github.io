interface AppleDesktopViewOptionsProps {
  open: boolean;
  iconScale: number;
  onIconScaleChange: (value: number) => void;
  onClose: () => void;
}

export function AppleDesktopViewOptions({
  open,
  iconScale,
  onIconScaleChange,
  onClose,
}: AppleDesktopViewOptionsProps) {
  if (!open) return null;

  const percent = Math.round(iconScale * 100);

  return (
    <div className="apple-desktop-view-options" role="dialog" aria-label="Desktop View Options">
      <header>
        <div>
          <strong>Desktop</strong>
          <small>View Options</small>
        </div>
        <button type="button" onClick={onClose} aria-label="Close View Options">×</button>
      </header>

      <div className="apple-desktop-view-options__row">
        <span>Icon size</span>
        <strong>{percent}%</strong>
      </div>

      <label className="apple-desktop-view-options__slider">
        <small>Small</small>
        <input
          type="range"
          min="82"
          max="118"
          step="2"
          value={percent}
          aria-label="Desktop icon size"
          onChange={(event) => onIconScaleChange(Number(event.target.value) / 100)}
        />
        <small>Large</small>
      </label>

      <div className="apple-desktop-view-options__presets">
        {[0.86, 1, 1.14].map((value) => (
          <button
            key={value}
            type="button"
            className={Math.abs(iconScale - value) < 0.03 ? 'is-active' : ''}
            onClick={() => onIconScaleChange(value)}
          >
            {value < 1 ? 'Small' : value > 1 ? 'Large' : 'Medium'}
          </button>
        ))}
      </div>
    </div>
  );
}
