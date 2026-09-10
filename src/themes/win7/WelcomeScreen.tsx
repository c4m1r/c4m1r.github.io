import { useEffect } from 'react';
import { useApp } from '../../contexts/useApp';
import { getSelectedEdition, editionLabel } from '../../shells/os/osEditions';
import loaderBase64 from './assets/boot/win7-greetings-loading.b64.txt?raw';
import { WIN7_ASSETS } from './assets';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { language } = useApp();
  const edition = getSelectedEdition('win7');
  const editionName = editionLabel(edition, language);

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2600);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="win7-welcome-screen os-shell os-win7"
      style={{ backgroundImage: `url(${WIN7_ASSETS.loginBackground})` }}
    >
      <div className="win7-welcome-screen__message" role="status" aria-live="polite">
        <span className="win7-welcome-screen__spinner" aria-hidden="true" />
        <span>{language === 'ru' ? 'Добро пожаловать' : 'Welcome'}</span>
      </div>

      <div className="win7-welcome-screen__brand" aria-label={`Windows 7 ${editionName}`}>
        <img src={WIN7_ASSETS.windowsLogo} alt="Windows 7" />
        <span className="win7-welcome-screen__edition">{editionName}</span>
      </div>

      <video
        className="win7-welcome-screen__loader"
        src={`data:video/webm;base64,${loaderBase64.trim()}`}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
    </div>
  );
}
