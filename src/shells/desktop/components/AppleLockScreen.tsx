import { useEffect } from 'react';
import { type Language } from '../../../i18n/translations';
import macWallpaper from '../../../../eat/playground-macos-main/public/img/ui/wallpaper.jpg';

interface AppleLockScreenProps {
  open: boolean;
  time: Date;
  language: Language;
  onUnlock: () => void;
}

export function AppleLockScreen({ open, time, language, onUnlock }: AppleLockScreenProps) {
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
      onClick={onUnlock}
      style={{ backgroundImage: `linear-gradient(rgba(10,14,22,0.08), rgba(10,14,22,0.24)), url(${macWallpaper})` }}
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
        <div className="apple-lock-screen__avatar">N</div>
        <strong>NervaWEB WebOS</strong>
        <span>Click or press any key to unlock</span>
      </div>
    </div>
  );
}
