import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { WIN7_ASSETS } from './assets';

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const { language } = useApp();
  const completedRef = useRef(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Keep startup usable even if the imported reference video cannot autoplay
    // or decode in a particular browser.
    const fallback = window.setTimeout(complete, 6500);
    return () => window.clearTimeout(fallback);
  }, [complete]);

  return (
    <div className="win7-boot-screen os-shell os-win7" role="status" aria-live="polite">
      <div className="win7-boot-screen__content">
        {!videoFailed ? (
          <video
            className="win7-boot-screen__animation"
            src={WIN7_ASSETS.bootVideo}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={complete}
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
          />
        ) : (
          <img
            className="win7-boot-screen__fallback-logo"
            src={WIN7_ASSETS.windowsLogo}
            alt="Windows 7"
          />
        )}
        <div className="win7-boot-screen__text">
          {language === 'ru' ? 'Запуск Windows' : 'Starting Windows'}
        </div>
      </div>
      <div className="win7-boot-screen__hint">
        {language === 'ru'
          ? 'Для лучшего отображения используйте полноэкранный режим'
          : 'For the best experience, use full screen'}
      </div>
    </div>
  );
}
