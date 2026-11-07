import { useState, useCallback } from 'react';
import { BootScreen as Win7BootScreen } from '../win7/BootScreen';
import { LoginScreen as Win7LoginScreen } from '../win7/LoginScreen';
import { WelcomeScreen as Win7WelcomeScreen } from '../win7/WelcomeScreen';
import { DesktopShell } from '../../shells/desktop/DesktopShell';
import { SystemTransitionScreen } from './SystemTransitionScreen';
import { useApp } from '../../contexts/useApp';
import '../win7/win7-shell.css';
import '../win7/desktop-fidelity.css';

type WebOSState = 'boot' | 'login' | 'welcome' | 'desktop' | 'logoff' | 'shutdown';

export function WebOS() {
  const [state, setState] = useState<WebOSState>('boot');
  const { setMode } = useApp();

  const exitToGrub = useCallback(() => {
    setMode('grub');
    setState('boot');
  }, [setMode]);

  const handleSystemCommand = useCallback((command: 'logoff' | 'shutdown') => {
    if (command === 'shutdown') setState('shutdown');
    else setState('logoff');
  }, []);

  if (state === 'boot') {
    return <Win7BootScreen onComplete={() => setState('login')} />;
  }

  if (state === 'login') {
    return (
      <Win7LoginScreen
        onLogin={() => setState('welcome')}
        onRestart={() => setState('boot')}
        onShutdown={() => setState('shutdown')}
      />
    );
  }

  if (state === 'welcome') {
    return <Win7WelcomeScreen onComplete={() => setState('desktop')} />;
  }

  if (state === 'logoff') {
    return <SystemTransitionScreen mode="logoff" onComplete={() => setState('login')} />;
  }

  if (state === 'shutdown') {
    return <SystemTransitionScreen mode="shutdown" onComplete={exitToGrub} />;
  }

  return <DesktopShell onSystemCommand={handleSystemCommand} />;
}
