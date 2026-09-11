import { useState, useCallback } from 'react';
import { BootScreen } from './BootScreen';
import { LoginScreen } from './LoginScreen';
import { DesktopShell } from '../../shells/desktop/DesktopShell';
import { SystemTransitionScreen } from './SystemTransitionScreen';
import { useApp } from '../../contexts/useApp';

type WebOSState = 'boot' | 'login' | 'desktop' | 'logoff' | 'shutdown';

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

  if (state === 'boot') return <BootScreen onComplete={() => setState('login')} />;

  // The blue "Welcome" interstitial is specific to Windows XP. Generic shells
  // (including Windows 98) proceed directly from their own login surface.
  if (state === 'login') return <LoginScreen onLogin={() => setState('desktop')} />;

  if (state === 'logoff') {
    return <SystemTransitionScreen mode="logoff" onComplete={() => setState('login')} />;
  }

  if (state === 'shutdown') {
    return <SystemTransitionScreen mode="shutdown" onComplete={exitToGrub} />;
  }

  return <DesktopShell onSystemCommand={handleSystemCommand} />;
}
