import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { type ThemeId } from '../../../contexts/appContextTypes';

interface AppleControlCenterProps {
  theme: ThemeId;
  open: boolean;
  volumeLevel: number;
  brightnessLevel: number;
  nightModeEnabled: boolean;
  isFullscreen: boolean;
  onClose: () => void;
  onVolumeLevelChange: (value: number) => void;
  onBrightnessLevelChange: (value: number) => void;
  onNightModeChange: (value: boolean) => void;
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
  nightModeEnabled,
  isFullscreen,
  onClose,
  onVolumeLevelChange,
  onBrightnessLevelChange,
  onNightModeChange,
  onFullscreenToggle,
  onOpenSettings,
  onOpenAbout,
  onLaunchApp,
}: AppleControlCenterProps) {
  const [wifi, setWifi] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('ios-wifi-enabled') !== 'false';
  });
  const [bluetooth, setBluetooth] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('ios-bluetooth-enabled') !== 'false';
  });
  const [macWifi, setMacWifi] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-wifi-enabled') !== 'false';
  });
  const [macBluetooth, setMacBluetooth] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-bluetooth-enabled') !== 'false';
  });
  const [airplane, setAirplane] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ios-airplane-enabled') === 'true';
  });
  const [cellular, setCellular] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('ios-cellular-enabled') !== 'false';
  });
  const [silentMode, setSilentMode] = useState(false);
  const previousVolumeRef = useRef(volumeLevel || 50);
  useEffect(() => {
    const handleMacConnectivityChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ wifi?: boolean; bluetooth?: boolean }>;
      if (typeof customEvent.detail?.wifi === 'boolean') setMacWifi(customEvent.detail.wifi);
      if (typeof customEvent.detail?.bluetooth === 'boolean') setMacBluetooth(customEvent.detail.bluetooth);
    };

    window.addEventListener('macos-connectivity-changed', handleMacConnectivityChange);
    return () => window.removeEventListener('macos-connectivity-changed', handleMacConnectivityChange);
  }, []);

  useEffect(() => {
    const handleConnectivityChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        wifi?: boolean;
        bluetooth?: boolean;
        cellular?: boolean;
        airplane?: boolean;
      }>;
      if (typeof customEvent.detail?.wifi === 'boolean') setWifi(customEvent.detail.wifi);
      if (typeof customEvent.detail?.bluetooth === 'boolean') setBluetooth(customEvent.detail.bluetooth);
      if (typeof customEvent.detail?.cellular === 'boolean') setCellular(customEvent.detail.cellular);
      if (typeof customEvent.detail?.airplane === 'boolean') setAirplane(customEvent.detail.airplane);
    };

    window.addEventListener('ios-connectivity-changed', handleConnectivityChange);
    return () => window.removeEventListener('ios-connectivity-changed', handleConnectivityChange);
  }, []);

  const setMacConnectivity = (key: 'wifi' | 'bluetooth', value: boolean) => {
    if (key === 'wifi') setMacWifi(value);
    else setMacBluetooth(value);

    localStorage.setItem(`macos-${key}-enabled`, String(value));
    window.dispatchEvent(new CustomEvent('macos-connectivity-changed', {
      detail: { [key]: value },
    }));
  };

  const setConnectivity = (
    key: 'wifi' | 'bluetooth' | 'cellular' | 'airplane',
    value: boolean
  ) => {
    if (key === 'wifi') setWifi(value);
    else if (key === 'bluetooth') setBluetooth(value);
    else if (key === 'cellular') setCellular(value);
    else setAirplane(value);

    localStorage.setItem(`ios-${key}-enabled`, String(value));
    window.dispatchEvent(new CustomEvent('ios-connectivity-changed', {
      detail: { [key]: value },
    }));
  };


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
              { key: 'wifi', label: 'Wi-Fi', active: wifi, toggle: () => setConnectivity('wifi', !wifi), glyph: '⌁' },
              {
                key: 'airplane',
                label: 'Airplane',
                active: airplane,
                toggle: () => {
                  const next = !airplane;
                  setConnectivity('airplane', next);
                  if (next) {
                    setConnectivity('wifi', false);
                    setConnectivity('cellular', false);
                  }
                },
                glyph: '✈',
              },
              { key: 'cellular', label: 'Cellular', active: cellular, toggle: () => setConnectivity('cellular', !cellular), glyph: '◒' },
              { key: 'bluetooth', label: 'Bluetooth', active: bluetooth, toggle: () => setConnectivity('bluetooth', !bluetooth), glyph: 'ᛒ' },
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
                className={nightModeEnabled ? 'is-active' : ''}
                aria-pressed={nightModeEnabled}
                onClick={() => onNightModeChange(!nightModeEnabled)}
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
              aria-pressed={silentMode}
              onClick={() => {
                if (silentMode) {
                  setSilentMode(false);
                  onVolumeLevelChange(Math.max(1, previousVolumeRef.current));
                  return;
                }
                if (volumeLevel > 0) previousVolumeRef.current = volumeLevel;
                setSilentMode(true);
                onVolumeLevelChange(0);
              }}
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
          <button
            type="button"
            className={`apple-control-center__tile ${macWifi ? 'is-active' : ''}`}
            aria-pressed={macWifi}
            onClick={() => setMacConnectivity('wifi', !macWifi)}
          >
            <span className="apple-control-center__tile-icon">⌁</span>
            <span>
              <strong>Wi-Fi</strong>
              <small>{macWifi ? 'Connected' : 'Off'}</small>
            </span>
          </button>
          <button
            type="button"
            className={`apple-control-center__tile ${macBluetooth ? 'is-active' : ''}`}
            aria-pressed={macBluetooth}
            onClick={() => setMacConnectivity('bluetooth', !macBluetooth)}
          >
            <span className="apple-control-center__tile-icon">ᛒ</span>
            <span>
              <strong>Bluetooth</strong>
              <small>{macBluetooth ? 'On' : 'Off'}</small>
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
