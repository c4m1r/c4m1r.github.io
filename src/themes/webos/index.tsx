import { useState, useCallback } from 'react';
import { BootScreen } from './BootScreen';
import { LoginScreen } from './LoginScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { DesktopShell } from '../../shells/desktop/DesktopShell';
import { SystemTransitionScreen } from './SystemTransitionScreen';
import { useApp } from '../../contexts/useApp';
import { Windows2000StartupScreen } from '../classicBoot/ClassicBootScreen';

type WebOSState = 'boot' | 'startup' | 'login' | 'welcome' | 'desktop' | 'logoff' | 'shutdown';

export function WebOS() {
  const [state, setState] = useState<WebOSState>('boot');
  const { setMode, theme } = useApp();

  const exitToPowerOff = useCallback(() => {
    setMode('poweroff');
    setState('boot');
  }, [setMode]);

  const handleSystemCommand = useCallback((command: 'logoff' | 'shutdown') => {
    if (command === 'shutdown') setState('shutdown');
    else setState('logoff');
  }, []);

  if (state === 'boot') {
    // Windows 2000 shows its first post-boot GIF before logon.
    return <BootScreen onComplete={() => setState(theme === 'win2000' ? 'startup' : 'login')} />;
  }

  if (state === 'startup') {
    return <Windows2000StartupScreen onComplete={() => setState('login')} />;
  }

  if (state === 'login') {
    return (
      <LoginScreen
        onLogin={() => setState('welcome')}
      />
    );
  }

  if (state === 'welcome') {
    return <WelcomeScreen onComplete={() => setState('desktop')} />;
  }

  if (state === 'logoff') {
    return <SystemTransitionScreen mode="logoff" onComplete={() => setState('login')} />;
  }

  if (state === 'shutdown') {
    return <SystemTransitionScreen mode="shutdown" onComplete={exitToPowerOff} />;
  }

  return <DesktopShell onSystemCommand={handleSystemCommand} />;
}
