import { useEffect, useState } from 'react';
import './xp.css';

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);

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
        {/* Authentic Windows XP Boot Brand */}
        <div className="xp-boot-screen__identity">
          <div className="xp-boot-screen__flag" aria-hidden="true">
            <span className="xp-flag-tile xp-flag-red" />
            <span className="xp-flag-tile xp-flag-green" />
            <span className="xp-flag-tile xp-flag-blue" />
            <span className="xp-flag-tile xp-flag-yellow" />
          </div>
          <div className="xp-boot-screen__text">
            <span className="xp-boot-screen__microsoft">Microsoft</span>
            <div className="xp-boot-screen__product">
              <span className="xp-boot-screen__windows">Windows</span>
              <span className="xp-boot-screen__xp">XP</span>
            </div>
          </div>
        </div>

        {/* XP Progress Indicator Frame */}
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
