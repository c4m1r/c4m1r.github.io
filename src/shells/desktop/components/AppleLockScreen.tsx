import { useEffect, useRef } from 'react';
import { type Language } from '../../../i18n/translations';
import { type ThemeId } from '../../../contexts/appContextTypes';
import macWallpaper from '../../../../eat/playground-macos-main/public/img/ui/wallpaper.jpg';
import iosWallpaper from '../../../../eat/macos-portfolio-main/public/images/mobile-wallpaper.webp';

interface AppleLockScreenProps {
  open: boolean;
  theme: ThemeId;
  time: Date;
  language: Language;
  onUnlock: () => void;
}

export function AppleLockScreen({ open, theme, time, language, onUnlock }: AppleLockScreenProps) {
  const swipeStartY = useRef<number | null>(null);
  const isIos = theme.startsWith('ios-');
  useEffect(() => {
    if (!open) return;
    const onKeyDown = () => onUnlock();
    window.addEventListener('keydown', onKeyDown, { once: true });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onUnlock, open]);

  if (!open) return null;

  return (
    <div
      className="apple-lock-screen"
      role="dialog"
      aria-label="Lock Screen"
      onClick={isIos ? undefined : onUnlock}
      onPointerDown={(event) => {
        if (!isIos) return;
        swipeStartY.current = event.clientY;
      }}
      onPointerUp={(event) => {
        if (!isIos) return;
        const startY = swipeStartY.current;
        swipeStartY.current = null;
        if (startY === null) return;
        if (startY - event.clientY >= 44) onUnlock();
      }}
      style={{
        backgroundImage: `linear-gradient(rgba(10,14,22,0.08), rgba(10,14,22,0.24)), url(${isIos ? iosWallpaper : macWallpaper})`,
      }}
    >
      <div className="apple-lock-screen__shade" />
      <div className="apple-lock-screen__time">
        <span>
          {time.toLocaleDateString(language, { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <strong>
          {time.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
        </strong>
      </div>
      <div className="apple-lock-screen__user">
        {!isIos && <div className="apple-lock-screen__avatar">N</div>}
        <strong>NervaWEB WebOS</strong>
        <span>{isIos ? 'Swipe up to unlock' : 'Click or press any key to unlock'}</span>
        {isIos && <i className="apple-lock-screen__home-indicator" aria-hidden="true" />}
      </div>
    </div>
  );
}
