import { lazy, Suspense } from 'react';
import { useApp } from './contexts/useApp';
import { useEffect, useState } from 'react';
import { getOsSkinRules } from './shells/os/osSkins';
import { loadOsStyleSheets } from './styles/os/osStyleSheets';
import { GrubMenu } from './apps/GrubMenu';
import { BiosPostScreen } from './apps/bios/BiosPostScreen';
import { PowerOffScreen } from './apps/bios/PowerOffScreen';
import { WeatherProvider } from './contexts/WeatherContext';
import { WeatherEffects } from './components/WeatherEffects';

const BlogSite = lazy(() => import('./apps/BlogSite').then((module) => ({ default: module.BlogSite })));
const Terminal = lazy(() => import('./apps/Terminal').then((module) => ({ default: module.Terminal })));
const WindowsXP = lazy(() => import('./themes/winxp').then((module) => ({ default: module.WindowsXP })));
const Windows7 = lazy(() => import('./themes/win7').then((module) => ({ default: module.Windows7 })));
const WebOS = lazy(() => import('./themes/webos').then((module) => ({ default: module.WebOS })));

function LazyFallback() {
  return <div className="min-h-screen bg-background" aria-live="polite" />;
}

/** True once the stylesheets of the current OS are in the document. */
function useOsStyleSheets(osClassName: string): boolean {
  const [readyFor, setReadyFor] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadOsStyleSheets(osClassName).then(() => {
      if (!cancelled) setReadyFor(osClassName);
    });
    return () => {
      cancelled = true;
    };
  }, [osClassName]);
  return readyFor === osClassName;
}

function App() {
  const { mode, theme, setMode } = useApp();
  const osStylesReady = useOsStyleSheets(getOsSkinRules(theme).osClassName);

  if (mode === 'bios') {
    return <BiosPostScreen onComplete={() => setMode('grub')} />;
  }

  if (mode === 'poweroff') {
    return <PowerOffScreen onPowerOn={() => setMode('bios')} />;
  }

  if (mode === 'grub') {
    return <GrubMenu />;
  }

  if (mode === 'blog') {
    return (
      <WeatherProvider>
        <WeatherEffects />
        <Suspense fallback={<LazyFallback />}>
          <BlogSite />
        </Suspense>
      </WeatherProvider>
    );
  }

  if (mode === 'terminal') {
    return (
      <Suspense fallback={<LazyFallback />}>
        <Terminal />
      </Suspense>
    );
  }

  if (mode === 'webos') {
    if (!osStylesReady) return <LazyFallback />;
    return (
      <Suspense fallback={<LazyFallback />}>
        {theme === 'win-xp' ? <WindowsXP /> : theme === 'win7' ? <Windows7 /> : <WebOS />}
      </Suspense>
    );
  }

  return <GrubMenu />;
}

export default App;
