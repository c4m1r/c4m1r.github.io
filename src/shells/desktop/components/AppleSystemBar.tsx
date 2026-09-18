import { type MouseEvent } from 'react';
import iosWifiIcon from '../../../../eat/homescreen-main/public/icons/wifi.svg';
import iosBatteryIcon from '../../../../eat/homescreen-main/public/icons/battery-75.svg';
import { type ThemeId } from '../../../contexts/appContextTypes';
import { type Language } from '../../../i18n/translations';

interface AppleSystemBarProps {
  theme: ThemeId;
  language: Language;
  time: Date;
  activeAppTitle?: string;
  onAppleMenuToggle: () => void;
  onControlCenterToggle: () => void;
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
}: AppleSystemBarProps) {
  const isMac = theme === 'macos-26';
  const isIos = theme.startsWith('ios-');

  if (!isMac && !isIos) return null;

  const timeLabel = time.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isIos) {
    return (
      <div className="apple-system-bar apple-ios-statusbar" aria-label="iOS status bar">
        <span className="apple-ios-time">{timeLabel}</span>
        <span className="apple-ios-device-slot" aria-hidden="true" />
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
            <img className="apple-ios-battery-icon" src={iosBatteryIcon} alt="" />
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
        <span className="apple-macos-menu-item apple-macos-status">100%</span>
        <span className="apple-macos-menu-item apple-macos-status">⌁</span>
        <button
          type="button"
          className="apple-macos-menu-item apple-macos-control-center"
          onClick={onControlCenterToggle}
          aria-label="Open Control Center"
        >
          ◐
        </button>
        <span className="apple-macos-menu-item apple-macos-date">{dateLabel}</span>
        <span className="apple-macos-menu-item apple-macos-time">{timeLabel}</span>
      </div>
    </div>
  );
}
