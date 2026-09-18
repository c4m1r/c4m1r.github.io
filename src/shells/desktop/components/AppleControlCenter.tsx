import { useState, type CSSProperties } from 'react';
import { type ThemeId } from '../../../contexts/appContextTypes';

interface AppleControlCenterProps {
  theme: ThemeId;
  open: boolean;
  volumeLevel: number;
  brightnessLevel: number;
  isFullscreen: boolean;
  onClose: () => void;
  onVolumeLevelChange: (value: number) => void;
  onBrightnessLevelChange: (value: number) => void;
  onFullscreenToggle: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onLaunchApp?: (appId: string) => void;
}

export function AppleControlCenter({
  theme,
  open,
  volumeLevel,
  brightnessLevel,
  isFullscreen,
  onClose,
  onVolumeLevelChange,
  onBrightnessLevelChange,
  onFullscreenToggle,
  onOpenSettings,
  onOpenAbout,
  onLaunchApp,
}: AppleControlCenterProps) {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airplane, setAirplane] = useState(false);
  const [cellular, setCellular] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [silentMode, setSilentMode] = useState(false);

  if (!open) return null;

  const isIos = theme.startsWith('ios-');

  if (isIos) {
    return (
      <div
        className="apple-control-center apple-ios-control-center"
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

        <div className="apple-ios-control-center__panel">
          <div className="apple-ios-control-center__connectivity">
            {[
              { key: 'wifi', label: 'Wi-Fi', active: wifi, toggle: () => setWifi((value) => !value), glyph: '⌁' },
              { key: 'airplane', label: 'Airplane', active: airplane, toggle: () => setAirplane((value) => !value), glyph: '✈' },
              { key: 'cellular', label: 'Cellular', active: cellular, toggle: () => setCellular((value) => !value), glyph: '◒' },
              { key: 'bluetooth', label: 'Bluetooth', active: bluetooth, toggle: () => setBluetooth((value) => !value), glyph: 'ᛒ' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className={`apple-ios-control-center__round ${item.active ? 'is-active' : ''}`}
                onClick={item.toggle}
                title={item.label}
                aria-pressed={item.active}
              >
                <span>{item.glyph}</span>
                <small>{item.label}</small>
              </button>
            ))}
          </div>

          <div className="apple-ios-control-center__now-playing">
            <div className="apple-ios-control-center__art">♪</div>
            <div className="apple-ios-control-center__track">
              <strong>Not Playing</strong>
              <small>Media controls</small>
            </div>
            <div className="apple-ios-control-center__transport" aria-hidden="true">◀︎  ▶︎</div>
          </div>

          <div className="apple-ios-control-center__middle">
            <div className="apple-ios-control-center__utilities">
              <button type="button" onClick={onFullscreenToggle}>
                <span>▣</span>
                <small>{isFullscreen ? 'Exit Full Screen' : 'Screen Mirroring'}</small>
              </button>
              <button
                type="button"
                className={nightMode ? 'is-active' : ''}
                onClick={() => setNightMode((value) => !value)}
              >
                <span>☾</span>
                <small>Night Mode</small>
              </button>
            </div>

            <div className="apple-ios-control-center__sliders">
              <label style={{ '--control-level': `${brightnessLevel}%` } as CSSProperties}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightnessLevel}
                  aria-label="Brightness"
                  onChange={(event) => onBrightnessLevelChange(Number(event.target.value))}
                />
                <span>☀</span>
                <small>{brightnessLevel}%</small>
              </label>
              <label style={{ '--control-level': `${volumeLevel}%` } as CSSProperties}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeLevel}
                  aria-label="Volume"
                  onChange={(event) => onVolumeLevelChange(Number(event.target.value))}
                />
                <span>◖</span>
                <small>{volumeLevel}%</small>
              </label>
            </div>
          </div>

          <div className="apple-ios-control-center__quick-actions">
            <button type="button" title="Calculator" onClick={() => onLaunchApp?.('calculator')}>＋</button>
            <button type="button" title="Photos" onClick={() => onLaunchApp?.('pictures')}>◉</button>
            <button type="button" title="Safari" onClick={() => onLaunchApp?.('internet-explorer')}>⌕</button>
            <button
              type="button"
              title="Silent Mode"
              className={silentMode ? 'is-active is-danger' : ''}
              onClick={() => setSilentMode((value) => !value)}
            >
              {silentMode ? '⌁' : '◒'}
            </button>
            <button type="button" title="Settings" onClick={onOpenSettings}>⚙</button>
            <button type="button" title="About" onClick={onOpenAbout}>i</button>
          </div>
        </div>
      </div>
    );
  }

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
