import { useEffect, useState } from 'react';
import {
  getSystemSettings,
  resetSystemSettings,
  subscribeSystemSettings,
  updateSystemSettings,
} from './settingsStore';
import { type SystemSettings } from './settingsTypes';

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(getSystemSettings);

  useEffect(() => {
    return subscribeSystemSettings((newSettings) => {
      setSettings(newSettings);
    });
  }, []);

  return {
    settings,
    updateSettings: updateSystemSettings,
    resetSettings: resetSystemSettings,
  };
}
