import { type MouseEvent } from 'react';
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
}: AppleSystemBarProps) {
  const isMac = theme === 'macos-26';
  const isIos = theme.startsWith('ios-');
  const { level: batteryLevel, charging: batteryCharging } = useDeviceBattery(isMac || isIos);

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
          onClick={onAppleMenuToggle}
          aria-label="Open Apple menu"
        >
          
        </button>
        <span className="apple-macos-menu-item apple-macos-app-title">{activeAppTitle || 'Finder'}</span>
        <span className="apple-macos-menu-item">File</span>
        <span className="apple-macos-menu-item">Edit</span>
        <span className="apple-macos-menu-item">View</span>
        <span className="apple-macos-menu-item">Go</span>
        <span className="apple-macos-menu-item">Window</span>
        <span className="apple-macos-menu-item">Help</span>
      </div>
      <div className="apple-macos-menu-right">
        <span className="apple-macos-menu-item apple-macos-status apple-macos-battery-status">
          <span>{batteryLevel ?? 100}%</span>
          <img src={macBatteryIcon} alt={batteryCharging ? 'Battery charging' : 'Battery'} />
        </span>
        <span className="apple-macos-menu-item apple-macos-status">
          <img className="apple-macos-status-icon apple-macos-wifi-icon" src={macWifiIcon} alt="Wi-Fi" />
        </span>
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
