import { useEffect } from 'react';

export interface DesktopSystemActionBridgeOptions {
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onTriggerEffect?: (effectName: string) => void;
}

export function useDesktopSystemActionBridge({
  onOpenSettings,
  onOpenAbout,
  onTriggerEffect,
}: DesktopSystemActionBridgeOptions) {
  useEffect(() => {
    const handleOpenSettings = () => {
      onOpenSettings();
    };
    const handleOpenAbout = () => {
      onOpenAbout();
    };
    const handleTriggerEffect = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const effectName = customEvent.detail ?? 'fireworks';
      if (onTriggerEffect) {
        onTriggerEffect(effectName);
      } else if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trigger-global-effect', { detail: effectName }));
      }
    };

    window.addEventListener('open-system-settings', handleOpenSettings);
    window.addEventListener('open-system-about', handleOpenAbout);
    window.addEventListener('trigger-system-effect', handleTriggerEffect);

    return () => {
      window.removeEventListener('open-system-settings', handleOpenSettings);
      window.removeEventListener('open-system-about', handleOpenAbout);
      window.removeEventListener('trigger-system-effect', handleTriggerEffect);
    };
  }, [onOpenSettings, onOpenAbout, onTriggerEffect]);
}
