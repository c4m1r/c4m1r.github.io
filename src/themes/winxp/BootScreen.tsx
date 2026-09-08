import { useEffect, useMemo, useState } from 'react';
import bootLogoPart0 from './assets/boot/xp-mark.b64.0.txt?raw';
import bootLogoPart1 from './assets/boot/xp-mark.b64.1.txt?raw';
import bootLogoPart2 from './assets/boot/xp-mark.b64.2.txt?raw';
import bootLogoPart3 from './assets/boot/xp-mark.b64.3.txt?raw';
import bootLogoPart4 from './assets/boot/xp-mark.b64.4.txt?raw';
import bootLogoPart5 from './assets/boot/xp-mark.b64.5.txt?raw';
import bootLogoPart6 from './assets/boot/xp-mark.b64.6.txt?raw';
import './xp.css';

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const bootLogo = useMemo(
    () =>
      `data:image/png;base64,${[
        bootLogoPart0,
        bootLogoPart1,
        bootLogoPart2,
        bootLogoPart3,
        bootLogoPart4,
        bootLogoPart5,
        bootLogoPart6,
      ].join('')}`,
    [],
  );

  useEffect(() => {
    setFadeIn(true);
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="xp-boot-screen os-shell os-winxp"
      style={{ opacity: fadeIn ? 1 : 0 }}
    >
      <div className="xp-boot-screen__center">
        <div className="xp-boot-screen__identity">
          <img
            src={bootLogo}
            alt="Microsoft Windows XP"
            className="xp-boot-screen__logo-img"
          />
        </div>

        <div className="xp-boot-screen__loader" aria-label="Loading">
          <div className="xp-boot-screen__loader-bar">
            <div className="xp-boot-screen__block" />
            <div className="xp-boot-screen__block" />
            <div className="xp-boot-screen__block" />
          </div>
        </div>
      </div>

      <div className="xp-boot-screen__copyright">Copyright © Microsoft Corporation</div>
    </div>
  );
}
