import { useEffect, useState } from 'react';

interface BatteryManagerLike {
  level: number;
  charging: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface BatteryNavigator extends Navigator {
  getBattery?: () => Promise<BatteryManagerLike>;
}

export interface DeviceBatteryState {
  level: number | null;
  charging: boolean;
  supported: boolean;
}

export function useDeviceBattery(enabled = true): DeviceBatteryState {
  const [level, setLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined') return;

    const batteryNavigator = navigator as BatteryNavigator;
    if (!batteryNavigator.getBattery) return;

    let battery: BatteryManagerLike | undefined;
    let disposed = false;

    const sync = () => {
      if (!battery || disposed) return;
      setLevel(Math.round(battery.level * 100));
      setCharging(battery.charging);
    };

    void batteryNavigator.getBattery().then((manager) => {
      if (disposed) return;
      battery = manager;
      setSupported(true);
      sync();
      battery.addEventListener('levelchange', sync);
      battery.addEventListener('chargingchange', sync);
    });

    return () => {
      disposed = true;
      battery?.removeEventListener('levelchange', sync);
      battery?.removeEventListener('chargingchange', sync);
    };
  }, [enabled]);

  return { level, charging, supported };
}
