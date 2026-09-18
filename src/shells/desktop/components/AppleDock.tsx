import { type ThemeId } from '../../../contexts/appContextTypes';
import macLaunchpadIcon from '../../../../eat/playground-macos-main/public/img/icons/launchpad.png';
import macSafariIcon from '../../../../eat/playground-macos-main/public/img/icons/safari.png';
import macTerminalIcon from '../../../../eat/playground-macos-main/public/img/icons/terminal.png';
import macSettingsIcon from '../../../../eat/macos-portfolio-main/public/icons/settings.svg';
import iosSafariIcon from '../../../../eat/homescreen-main/public/images/Icon=Safari.png';
import iosPhotosIcon from '../../../../eat/homescreen-main/public/images/Icon=Photos.png';
import iosNotesIcon from '../../../../eat/homescreen-main/public/images/Icon=Notes.png';
import iosSettingsIcon from '../../../../eat/homescreen-main/public/images/Icon=Settings.png';

interface AppleDockProps {
  theme: ThemeId;
  launcherOpen: boolean;
  onLauncherToggle: () => void;
  onLaunchApp: (appId: string) => void;
  openWindowIds: string[];
}

interface DockItem {
  id: string;
  title: string;
  appId?: string;
  src?: string;
  glyph?: string;
  launcher?: boolean;
}

const MAC_ITEMS: DockItem[] = [
  { id: 'launchpad', title: 'Launchpad', src: macLaunchpadIcon, launcher: true },
  { id: 'safari', title: 'Safari', appId: 'internet-explorer', src: macSafariIcon },
  { id: 'photos', title: 'Photos', appId: 'pictures', glyph: '✿' },
  { id: 'settings', title: 'System Settings', appId: 'control-panel', src: macSettingsIcon },
  { id: 'terminal', title: 'Terminal', appId: 'terminal', src: macTerminalIcon },
];

const IOS_ITEMS: DockItem[] = [
  { id: 'safari', title: 'Safari', appId: 'internet-explorer', src: iosSafariIcon },
  { id: 'photos', title: 'Photos', appId: 'pictures', src: iosPhotosIcon },
  { id: 'notes', title: 'Notes', appId: 'notepad', src: iosNotesIcon },
  { id: 'settings', title: 'Settings', appId: 'control-panel', src: iosSettingsIcon },
];

export function AppleDock({
  theme,
  launcherOpen,
  onLauncherToggle,
  onLaunchApp,
  openWindowIds,
}: AppleDockProps) {
  const isMac = theme === 'macos-26';
  const isIos = theme.startsWith('ios-');

  if (!isMac && !isIos) return null;

  const items = isMac ? MAC_ITEMS : IOS_ITEMS;

  return (
    <div
      className={isMac ? 'apple-dock apple-macos-dock' : 'apple-dock apple-ios-dock'}
      role="toolbar"
      aria-label={isMac ? 'Dock' : 'iOS Dock'}
    >
      {items.map((item) => {
        const active = item.launcher
          ? launcherOpen
          : Boolean(item.appId && openWindowIds.some((id) =>
              id === `app:${item.appId}` || id.startsWith(`app:${item.appId}-`)
            ));
        return (
          <button
            key={item.id}
            type="button"
            className={`apple-dock__item ${active ? 'is-active' : ''}`}
            title={item.title}
            aria-label={item.title}
            onClick={(event) => {
              event.stopPropagation();
              if (item.launcher) {
                onLauncherToggle();
                return;
              }
              if (item.appId) onLaunchApp(item.appId);
            }}
          >
            <span className="apple-dock__tooltip">{item.title}</span>
            <span className="apple-dock__icon">
              {item.src ? <img src={item.src} alt="" draggable={false} /> : <span>{item.glyph}</span>}
            </span>
            {isMac && item.appId && active && (
              <span className="apple-dock__running-dot" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}
