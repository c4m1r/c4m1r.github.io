import { useState, type MouseEvent } from 'react';
import iosWifiIcon from '../../../../eat/homescreen-main/public/icons/wifi.svg';
import iosBatteryIcon from '../../../../eat/homescreen-main/public/icons/battery-75.svg';
import macWifiIcon from '../../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/wifi.svg';
import macBatteryIcon from '../../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/battery.100.svg';
import macControlCenterIcon from '../../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/control-center.svg';
import macSearchIcon from '../../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/search.svg';
import { type ThemeId } from '../../../contexts/appContextTypes';
import { type Language } from '../../../i18n/translations';
import { useDeviceBattery } from '../hooks/useDeviceBattery';
import { IosDynamicIsland } from './IosDynamicIsland';

interface AppleSystemBarProps {
  theme: ThemeId;
  language: Language;
  time: Date;
  activeAppTitle?: string;
  onAppleMenuToggle: () => void;
  onControlCenterToggle: () => void;
  onNotificationCenterToggle: () => void;
  onSpotlightToggle: () => void;
  onOpenSettings: () => void;
  onQuitActiveApp: () => void;
  canQuitActiveApp: boolean;
}

function stop(event: MouseEvent) {
  event.stopPropagation();
}

export function AppleSystemBar({
  theme,
  language,
  time,
  activeAppTitle,
  onAppleMenuToggle,
  onControlCenterToggle,
  onNotificationCenterToggle,
  onSpotlightToggle,
  onOpenSettings,
  onQuitActiveApp,
  canQuitActiveApp,
}: AppleSystemBarProps) {
  const isMac = theme === 'macos-26';
  const isIos = theme.startsWith('ios-');
  const { level: batteryLevel, charging: batteryCharging } = useDeviceBattery(isMac || isIos);
  const [appMenuOpen, setAppMenuOpen] = useState(false);
  const [statusMenu, setStatusMenu] = useState<'battery' | 'wifi' | null>(null);

  if (!isMac && !isIos) return null;

  const timeLabel = time.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isIos) {
    return (
      <div className="apple-system-bar apple-ios-statusbar" aria-label="iOS status bar">
        <span className="apple-ios-time">{timeLabel}</span>
        {theme === 'ios-16' || theme === 'ios-26' ? (
          <IosDynamicIsland
            activeAppTitle={activeAppTitle}
            batteryLevel={batteryLevel}
            batteryCharging={batteryCharging}
          />
        ) : (
          <span className="apple-ios-device-slot" aria-hidden="true" />
        )}
        {theme === 'ios-5' ? (
          <span className="apple-ios-indicators" aria-label="Wi-Fi and battery">
            <span className="apple-ios-signal" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <img className="apple-ios-wifi-icon" src={iosWifiIcon} alt="Wi-Fi" />
            <img className="apple-ios-battery-icon" src={iosBatteryIcon} alt="Battery" />
          </span>
        ) : (
          <button
            type="button"
            className="apple-ios-indicators apple-ios-control-center-trigger"
            aria-label="Open Control Center"
            onMouseDown={stop}
            onClick={(event) => {
              stop(event);
              onControlCenterToggle();
            }}
          >
            <span className="apple-ios-signal" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <img className="apple-ios-wifi-icon" src={iosWifiIcon} alt="" />
            <span
              className={`apple-ios-battery-meter ${batteryCharging ? 'is-charging' : ''}`}
              aria-label={`Battery ${batteryLevel ?? 75}%`}
            >
              <span style={{ width: `${batteryLevel ?? 75}%` }} />
            </span>
          </button>
        )}
      </div>
    );
  }

  const dateLabel = time.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="apple-system-bar apple-macos-menubar" onMouseDown={stop} onClick={stop}>
      <div className="apple-macos-menu-left">
        <button
          type="button"
          className="apple-macos-menu-item apple-macos-logo"
          onClick={() => {
            setAppMenuOpen(false);
            onAppleMenuToggle();
          }}
          aria-label="Open Apple menu"
        >
          
        </button>
        <button
          type="button"
          className="apple-macos-menu-item apple-macos-app-title"
          onClick={() => setAppMenuOpen((value) => !value)}
          aria-expanded={appMenuOpen}
        >
          {activeAppTitle || 'Finder'}
        </button>
        <span className="apple-macos-menu-item">File</span>
        <span className="apple-macos-menu-item">Edit</span>
        <span className="apple-macos-menu-item">View</span>
        <span className="apple-macos-menu-item">Go</span>
        <span className="apple-macos-menu-item">Window</span>
        <span className="apple-macos-menu-item">Help</span>
        {appMenuOpen && (
          <div className="apple-app-menu" role="menu">
            <button type="button" role="menuitem" disabled>
              <span>About {activeAppTitle || 'Finder'}</span>
            </button>
            <div className="apple-app-menu__separator" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setAppMenuOpen(false);
                onOpenSettings();
              }}
            >
              <span>Settings…</span>
              <span className="apple-app-menu__hint">⌘,</span>
            </button>
            <button type="button" role="menuitem" disabled>
              <span>Services</span>
              <span className="apple-app-menu__hint">›</span>
            </button>
            <div className="apple-app-menu__separator" />
            <button type="button" role="menuitem" disabled>
              <span>Hide {activeAppTitle || 'Finder'}</span>
              <span className="apple-app-menu__hint">⌘H</span>
            </button>
            <button type="button" role="menuitem" disabled>
              <span>Hide Others</span>
              <span className="apple-app-menu__hint">⌥⌘H</span>
            </button>
            <div className="apple-app-menu__separator" />
            <button
              type="button"
              role="menuitem"
              disabled={!canQuitActiveApp}
              onClick={() => {
                if (!canQuitActiveApp) return;
                setAppMenuOpen(false);
                onQuitActiveApp();
              }}
            >
              <span>Quit {activeAppTitle || 'Finder'}</span>
              <span className="apple-app-menu__hint">⌘Q</span>
            </button>
          </div>
        )}
      </div>
      <div className="apple-macos-menu-right">
        <button
          type="button"
          className="apple-macos-menu-item apple-macos-status apple-macos-battery-status"
          onClick={() => {
            setAppMenuOpen(false);
            setStatusMenu((value) => value === 'battery' ? null : 'battery');
          }}
          aria-expanded={statusMenu === 'battery'}
          aria-label="Battery status"
        >
          <span>{batteryLevel ?? 100}%</span>
          <img src={macBatteryIcon} alt={batteryCharging ? 'Battery charging' : 'Battery'} />
        </button>
        <button
          type="button"
          className="apple-macos-menu-item apple-macos-status"
          onClick={() => {
            setAppMenuOpen(false);
            setStatusMenu((value) => value === 'wifi' ? null : 'wifi');
          }}
          aria-expanded={statusMenu === 'wifi'}
          aria-label="Wi-Fi status"
        >
          <img className="apple-macos-status-icon apple-macos-wifi-icon" src={macWifiIcon} alt="" />
        </button>
        {statusMenu && (
          <div className={`apple-status-menu apple-status-menu--${statusMenu}`} role="menu">
            {statusMenu === 'battery' ? (
              <>
                <header>
                  <strong>Battery</strong>
                  <span>{batteryLevel ?? 100}%</span>
                </header>
                <div className="apple-status-menu__row">
                  <span>Status</span>
                  <strong>{batteryCharging ? 'Charging' : 'Using Battery'}</strong>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setStatusMenu(null);
                    onOpenSettings();
                  }}
                >
                  Battery Settings…
                </button>
              </>
            ) : (
              <>
                <header>
                  <strong>Wi-Fi</strong>
                  <span>On</span>
                </header>
                <div className="apple-status-menu__row">
                  <span>Connection</span>
                  <strong>Browser network</strong>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setStatusMenu(null);
                    onOpenSettings();
                  }}
                >
                  Network Settings…
                </button>
              </>
            )}
          </div>
        )}
        <button
          type="button"
          className="apple-macos-menu-item apple-macos-spotlight"
          onClick={onSpotlightToggle}
          aria-label="Open Spotlight Search"
        >
          <img
            className="apple-macos-status-icon apple-macos-spotlight-icon"
            src={macSearchIcon}
            alt=""
          />
        </button>
        <button
          type="button"
          className="apple-macos-menu-item apple-macos-control-center"
          onClick={onControlCenterToggle}
          aria-label="Open Control Center"
        >
          <img
            className="apple-macos-status-icon apple-macos-control-center-icon"
            src={macControlCenterIcon}
            alt=""
          />
        </button>
        <button
          type="button"
          className="apple-macos-menu-item apple-macos-date-time"
          onClick={onNotificationCenterToggle}
          aria-label="Open Notification Center"
        >
          <span className="apple-macos-date">{dateLabel}</span>
          <span className="apple-macos-time">{timeLabel}</span>
        </button>
      </div>
    </div>
  );
}
