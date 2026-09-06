import { useApp } from '../../../contexts/useApp';
import { StartMenu } from './start-menu/StartMenu';
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
