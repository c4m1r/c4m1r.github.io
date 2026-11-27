import { useApp } from '../../../contexts/useApp';
import { StartMenu } from './start-menu/StartMenu';
import { StartScreen8 } from './start-menu/StartScreen8';
import { AppleLauncherSurface } from './AppleLauncherSurface';
import { getStartMenuSurface } from '../runtime/startMenuSurface';

export interface DesktopStartMenuSurfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
}

export function DesktopStartMenuSurface({
  isOpen,
  onClose,
  onLaunchApp,
  onOpenPath,
  onSystemCommand,
  onHover,
}: DesktopStartMenuSurfaceProps) {
  const { theme, language } = useApp();

  if (!isOpen) {
    return null;
  }

  if (theme === 'macos-26' || theme.startsWith('ios-')) {
    return (
      <AppleLauncherSurface
        onClose={onClose}
        onLaunchApp={onLaunchApp}
      />
    );
  }

  // Windows 8 has no Start menu: its Start button opens the tile dashboard, with the same entries and actions.
  if (theme === 'win8') {
    return (
      <StartScreen8
        onClose={onClose}
        onLaunchApp={onLaunchApp}
        onOpenPath={onOpenPath}
        onSystemCommand={onSystemCommand}
        onHover={onHover}
      />
    );
  }

  const surfaceInfo = getStartMenuSurface(theme, language);

  return (
    <div
      className={surfaceInfo.className}
      {...surfaceInfo.dataAttributes}
    >
      <StartMenu
        onClose={onClose}
        onLaunchApp={onLaunchApp}
        onOpenPath={onOpenPath}
        onSystemCommand={onSystemCommand}
        onHover={onHover}
      />
    </div>
  );
}
