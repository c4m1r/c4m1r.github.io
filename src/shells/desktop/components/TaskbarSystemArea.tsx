import type { RefObject } from 'react';
import { type Language } from '../../../i18n/translations';
import { SystemActionMenu } from '../../../system/actions/SystemActionMenu';

export interface TaskbarSystemAreaProps {
  language: Language;
  isXpFamily: boolean;
  trayRef: RefObject<HTMLDivElement>;
  volumeLevel: number;
  showVolumePanel: boolean;
  showNotificationPanel: boolean;
  showSystemActionMenu: boolean;
  onVolumeToggle: () => void;
  onNotificationToggle: () => void;
  onSystemActionToggle: () => void;
  onVolumeLevelChange: (level: number) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  time: Date;
  volumeIconSrc: string;
  muteIconSrc: string;
  fullscreenIconSrc?: string;
  notificationIconSrc?: string;
  trayExpandIconSrc?: string;
}

export function TaskbarSystemArea({
  isXpFamily,
  trayRef,
  volumeLevel,
  showVolumePanel,
  showNotificationPanel,
  showSystemActionMenu,
  onVolumeToggle,
  onNotificationToggle,
  onSystemActionToggle,
  onVolumeLevelChange,
  isFullscreen,
  onFullscreenToggle,
  time,
  volumeIconSrc,
  muteIconSrc,
  fullscreenIconSrc,
  notificationIconSrc,
  trayExpandIconSrc,
}: TaskbarSystemAreaProps) {
  return (
    <div className="taskbar-tray flex items-center gap-1.5 px-2 py-0.5 rounded-r" ref={trayRef}>
      {/* Fullscreen Toggle */}
      {fullscreenIconSrc && (
        <button
          onClick={onFullscreenToggle}
          className="taskbar-tray-icon"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          <img src={fullscreenIconSrc} alt="fullscreen" className="w-4 h-4" />
        </button>
      )}

      {/* Volume Control */}
      <div className="relative">
        <button
          onClick={onVolumeToggle}
          className="taskbar-tray-icon"
          title="Volume"
        >
          <img
            src={volumeLevel === 0 ? muteIconSrc : volumeIconSrc}
            alt="volume"
            className="w-4 h-4"
          />
        </button>
        {showVolumePanel && (
          <div className="absolute right-0 bottom-full mb-2 w-32 rounded-lg border border-[#90aee6] bg-[#fefefe] px-3 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.35)] flex items-center gap-3 z-50">
            <img
              src={volumeLevel === 0 ? muteIconSrc : volumeIconSrc}
              alt="Volume icon"
              className="volume-panel__icon w-4 h-4"
            />
            <div className="volume-slider-wrapper">
              <input
                type="range"
                min={0}
                max={100}
                value={volumeLevel}
                onChange={(e) => onVolumeLevelChange(Number(e.currentTarget.value))}
                className="volume-slider"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={onNotificationToggle}
          className="taskbar-tray-icon"
          title="Notifications"
        >
          {notificationIconSrc && (
            <img src={notificationIconSrc} alt="notifications" className="w-4 h-4" />
          )}
        </button>
        {showNotificationPanel && (
          <div className="absolute right-0 bottom-full mb-2 w-48 rounded-lg border border-[#90aee6] bg-[#fefefe] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.35)] text-[11px] text-[#1b1b1b] z-50">
            No new notifications
          </div>
        )}
      </div>

      {/* System Actions Tray Control */}
      <div className="relative">
        <button
          onClick={onSystemActionToggle}
          className="taskbar-tray-icon system-action-trigger"
          title="System Actions"
        >
          <span className="text-xs">⚡</span>
        </button>
        <SystemActionMenu
          isOpen={showSystemActionMenu}
          onClose={onSystemActionToggle}
        />
      </div>

      {/* Tray Expansion Slider */}
      {isXpFamily && trayExpandIconSrc && (
        <button
          className="taskbar-tray-icon taskbar-tray-icon--compact"
          title="Show hidden icons"
        >
          <img src={trayExpandIconSrc} alt="" className="w-3 h-3" />
        </button>
      )}

      {/* Clock */}
      <div className="taskbar-tray-time">
        <span
          className="text-[11px] font-semibold tracking-wide uppercase"
          style={{ textShadow: '0 1px 0 rgba(0,0,0,0.4)', letterSpacing: '0.05em' }}
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
