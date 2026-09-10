import { useState, useCallback } from 'react';
import { BootScreen } from './BootScreen';
import { LoginScreen } from './LoginScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { DesktopShell } from '../../shells/desktop/DesktopShell';
import { SystemTransitionScreen } from './SystemTransitionScreen';
import { useApp } from '../../contexts/useApp';

type WebOSState = 'boot' | 'login' | 'welcome' | 'desktop' | 'logoff' | 'shutdown';

export function WebOS() {
  const [state, setState] = useState<WebOSState>('boot');
  const { setMode, theme } = useApp();
  const exitToGrub = useCallback(() => {
    setMode('grub');
    setState('boot');
  }, [setMode]);
  const handleSystemCommand = useCallback((command: 'logoff' | 'shutdown') => {
    setState(command === 'shutdown' ? 'shutdown' : 'logoff');
  }, []);
  const completeLogin = useCallback(() => {
    // The blue italic Welcome banner is an XP transition, not a Windows 98 screen.
    setState(theme === 'win-98' ? 'desktop' : 'welcome');
  }, [theme]);

  if (state === 'boot') return <BootScreen onComplete={() => setState('login')} />;
  if (state === 'login') return <LoginScreen onLogin={completeLogin} />;
  if (state === 'welcome') return <WelcomeScreen onComplete={() => setState('desktop')} />;
  if (state === 'logoff') return <SystemTransitionScreen mode="logoff" onComplete={() => setState('login')} />;
  if (state === 'shutdown') return <SystemTransitionScreen mode="shutdown" onComplete={exitToGrub} />;
  return <DesktopShell onSystemCommand={handleSystemCommand} />;
}
