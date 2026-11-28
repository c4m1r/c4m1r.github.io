import { useApp } from '../../../../contexts/useApp';
import { StartMenu98 } from './StartMenu98';
import { StartMenu7 } from './StartMenu7';
import { StartMenuXP } from './StartMenuXP';
import { StartMenu10 } from './StartMenu10';
import { StartMenu11 } from './StartMenu11';

export interface StartMenuProps {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
}

export function StartMenu({ onClose, onLaunchApp, onOpenPath, onSystemCommand, onHover }: StartMenuProps) {
  const { theme } = useApp();

  if (theme === 'win-98' || theme === 'win2000') {
    return (
      <StartMenu98
        onClose={onClose}
        onLaunchApp={onLaunchApp}
        onOpenPath={onOpenPath}
        onSystemCommand={onSystemCommand}
        onHover={onHover}
      />
    );
  }

  if (theme === 'win10') {
    return <StartMenu10 onClose={onClose} onLaunchApp={onLaunchApp} onOpenPath={onOpenPath} onSystemCommand={onSystemCommand} onHover={onHover} />;
  }

  if (theme === 'win11') {
    return <StartMenu11 onClose={onClose} onLaunchApp={onLaunchApp} onOpenPath={onOpenPath} onSystemCommand={onSystemCommand} onHover={onHover} />;
  }

  if (theme === 'win7' || theme === 'vista') {
    return (
      <StartMenu7
        variant={theme === 'vista' ? 'vista' : 'win7'}
        onClose={onClose}
        onLaunchApp={onLaunchApp}
        onOpenPath={onOpenPath}
        onSystemCommand={onSystemCommand}
        onHover={onHover}
      />
    );
  }

  const appearance = theme === 'win-xp' ? 'win-xp' : 'webos';

  return (
    <StartMenuXP
      onClose={onClose}
      onLaunchApp={onLaunchApp}
      onOpenPath={onOpenPath}
      onSystemCommand={onSystemCommand}
      appearance={appearance}
      onHover={onHover}
    />
  );
}
