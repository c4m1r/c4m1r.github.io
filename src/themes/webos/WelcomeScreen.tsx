import { useEffect, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { AppleWelcomeScreen, isAppleTheme } from '../apple/AppleSessionScreens';
import { getOsClassName } from '../../shells/os/osClassNames';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { theme } = useApp();
  const [fadeIn, setFadeIn] = useState(false);
  const osClassName = getOsClassName(theme);

  if (isAppleTheme(theme)) {
    return <AppleWelcomeScreen theme={theme} onComplete={onComplete} />;
  }

  useEffect(() => {
    setFadeIn(true);
    // Auto-complete after 3 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`min-h-screen flex items-center justify-start relative overflow-hidden os-shell os-${osClassName}`}
      style={{
        background: '#1231a1',
        paddingTop: '78px',
        paddingBottom: '94px'
      }}
    >
      {/* Main content area */}
      <div 
        className="w-full h-full flex items-center justify-start relative"
        style={{
          background: 'radial-gradient(circle at 5% 8%, #91b0ee, #5a7edc 15%)'
        }}
      >
        {/* Decorative top line */}
        <div 
          className="absolute top-0 left-0 right-0"
          style={{
            height: '2px',
            background: 'linear-gradient(to right, #5076d4, #c3dafd 15% 50%, transparent)'
          }}
        />

        {/* Decorative bottom line */}
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '2px',
            background: 'linear-gradient(to right, #06389c, #f99737 15% 50%, transparent)'
          }}
        />

        {/* Welcome Title */}
        <span
          className="text-white font-bold italic z-10"
          style={{
            fontFamily: 'Franklin Gothic Medium, Arial Narrow, Arial, sans-serif',
            fontSize: '50px',
            textShadow: '2px 3px #3151b5',
            paddingLeft: '124px',
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 500ms linear'
          }}
        >
          welcome
        </span>
      </div>
    </div>
  );
}


