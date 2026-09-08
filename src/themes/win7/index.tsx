import { useCallback, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { DesktopShell } from '../../shells/desktop/DesktopShell';
import { BootScreen } from './BootScreen';
import { LoginScreen } from './LoginScreen';
import { SystemTransitionScreen } from './SystemTransitionScreen';
import './win7-shell.css';

type Windows7State = 'boot' | 'login' | 'desktop' | 'logoff' | 'shutdown';

export function Windows7() {
  const [state, setState] = useState<Windows7State>('boot');
  const { setMode } = useApp();

  const exitToGrub = useCallback(() => {
    setMode('grub');
    setState('boot');
  }, [setMode]);

  const handleSystemCommand = useCallback((command: 'logoff' | 'shutdown') => {
    setState(command);
  }, []);

  if (state === 'boot') {
    return <BootScreen onComplete={() => setState('login')} />;
  }

  if (state === 'login') {
    return (
      <LoginScreen
        onLogin={() => setState('desktop')}
        onRestart={() => setState('boot')}
        onShutdown={() => setState('shutdown')}
      />
    );
  }

  if (state === 'logoff') {
    return <SystemTransitionScreen mode="logoff" onComplete={() => setState('login')} />;
  }

  if (state === 'shutdown') {
    return <SystemTransitionScreen mode="shutdown" onComplete={exitToGrub} />;
  }

  return <DesktopShell onSystemCommand={handleSystemCommand} />;
}
