import { useState, useCallback, useEffect } from 'react';
import { BootScreen } from './BootScreen';
import { LoginScreen } from './LoginScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { DesktopShell } from '../../shells/desktop/DesktopShell';
import { SystemTransitionScreen } from './SystemTransitionScreen';
import { useApp } from '../../contexts/useApp';
import { Windows2000StartupScreen } from '../classicBoot/ClassicBootScreen';
import { preloadThemeAssets } from '../bootPreload';
import { THEME_ASSETS, type ThemeAssets } from './themeAssets';

type WebOSState = 'boot' | 'startup' | 'login' | 'welcome' | 'loading' | 'desktop' | 'logoff' | 'shutdown';

/**
 * Waits until the theme's media is cached, then opens the desktop. The screen only shows the wallpaper,
 * so the desktop never appears white while its icons and sounds load.
 */
function SessionLoading({ onComplete }: { onComplete: () => void }) {
  const { theme } = useApp();
  useEffect(() => {
    let cancelled = false;
    void preloadThemeAssets(theme).then(() => {
      if (!cancelled) onComplete();
    });
    return () => {
      cancelled = true;
    };
  }, [theme, onComplete]);
  const wallpaper = (THEME_ASSETS as Record<string, ThemeAssets>)[theme]?.wallpaper;
  return (
    <div
      className="min-h-screen"
      style={{
        background: '#000000',
        backgroundImage: wallpaper ? `url(${wallpaper})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}

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
        // Only the webos theme keeps the XP-style welcome; the other skins go straight to a preloaded desktop.
        onLogin={() => setState(theme === 'webos' ? 'welcome' : 'loading')}
      />
    );
  }

  if (state === 'welcome') {
    return <WelcomeScreen onComplete={() => setState('desktop')} />;
  }

  if (state === 'loading') {
    return <SessionLoading onComplete={() => setState('desktop')} />;
  }

  if (state === 'logoff') {
    return <SystemTransitionScreen mode="logoff" onComplete={() => setState('login')} />;
  }

  if (state === 'shutdown') {
    return <SystemTransitionScreen mode="shutdown" onComplete={exitToPowerOff} />;
  }

  return <DesktopShell onSystemCommand={handleSystemCommand} />;
}
