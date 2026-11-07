import { useCallback, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { DesktopShell } from '../../shells/desktop/DesktopShell';
import { BootScreen } from './BootScreen';
import { LoginScreen } from './LoginScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { SystemTransitionScreen } from './SystemTransitionScreen';
import './win7-shell.css';
import './desktop-fidelity.css';

type Windows7State = 'boot' | 'login' | 'welcome' | 'desktop' | 'logoff' | 'shutdown';

export function Windows7() {
  const [state, setState] = useState<Windows7State>('boot');
  const { setMode } = useApp();

  const exitToPowerOff = useCallback(() => {
    setMode('poweroff');
    setState('boot');
  }, [setMode]);

  const handleSystemCommand = useCallback((command: 'logoff' | 'shutdown') => {
    setState(command);
  }, []);

  if (state === 'boot') return <BootScreen onComplete={() => setState('login')} />;

  if (state === 'login') {
    return (
      <LoginScreen
        onLogin={() => setState('welcome')}
        onRestart={() => setMode('bios')}
        onShutdown={() => setMode('poweroff')}
      />
    );
  }

  if (state === 'welcome') return <WelcomeScreen onComplete={() => setState('desktop')} />;

  if (state === 'logoff') {
    return <SystemTransitionScreen mode="logoff" onComplete={() => setState('login')} />;
  }

  if (state === 'shutdown') {
    return <SystemTransitionScreen mode="shutdown" onComplete={exitToPowerOff} />;
  }

  return <DesktopShell onSystemCommand={handleSystemCommand} />;
}
