import { lazy, Suspense } from 'react';
import { useApp } from './contexts/useApp';
import { GrubMenu } from './apps/GrubMenu';
import { WeatherProvider } from './contexts/WeatherContext';
import { WeatherEffects } from './components/WeatherEffects';

const BlogSite = lazy(() => import('./apps/BlogSite').then((module) => ({ default: module.BlogSite })));
const Terminal = lazy(() => import('./apps/Terminal').then((module) => ({ default: module.Terminal })));
const WindowsXP = lazy(() => import('./themes/winxp').then((module) => ({ default: module.WindowsXP })));
const WebOS = lazy(() => import('./themes/webos').then((module) => ({ default: module.WebOS })));

function LazyFallback() {
  return <div className="min-h-screen bg-background" aria-live="polite" />;
}

function App() {
  const { mode, theme } = useApp();

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
    return (
      <Suspense fallback={<LazyFallback />}>
        {theme === 'win-xp' ? <WindowsXP /> : <WebOS />}
      </Suspense>
    );
  }

  return <GrubMenu />;
}

export default App;
