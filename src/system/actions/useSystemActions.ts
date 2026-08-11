import { useApp } from '../../contexts/useApp';
import { useSystemSettings } from '../settings/useSystemSettings';
import { executeSystemAction, getSystemActions } from './systemActions';
import { type SystemActionId } from './systemActionTypes';

export function useSystemActions() {
  const { language, setLanguage, theme } = useApp();
  const { settings, updateSettings } = useSystemSettings();

  const runAction = (actionId: SystemActionId) => {
    executeSystemAction(actionId, {
      theme,
      language,
      settings,
      updateSettings,
      setLanguage,
    });
  };

  return {
    actions: getSystemActions(),
    executeAction: runAction,
  };
}
