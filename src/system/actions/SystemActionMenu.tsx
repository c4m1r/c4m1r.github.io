import { useEffect, useRef } from 'react';
import { useApp } from '../../contexts/useApp';
import { getShellIntegrationRules } from '../integrations/shellIntegrations';
import { useSystemActions } from './useSystemActions';
import { type SystemActionId } from './systemActionTypes';

export interface SystemActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function SystemActionMenu({
  isOpen,
  onClose,
  className = '',
}: SystemActionMenuProps) {
  const { theme, language } = useApp();
  const { actions, executeAction } = useSystemActions();
  const menuRef = useRef<HTMLDivElement>(null);

  const integrationRules = getShellIntegrationRules(theme);
  const touchMeta = integrationRules.touchMetadata;
  const isTouch = touchMeta?.pointerMode === 'touch';

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Order actions based on integration rules placement priorities
  const placements = integrationRules.placements ?? [];
  const placementMap = new Map(placements.map((p) => [p.actionId, p]));

  const actionItems = actions.map((act) => ({
    action: act,
    placement: placementMap.get(act.id),
  }));

  actionItems.sort(
    (a, b) => (a.placement?.priority ?? 99) - (b.placement?.priority ?? 99)
  );

  const handleExecute = (actionId: SystemActionId) => {
    executeAction(actionId);
    onClose();
  };

  const itemHeight = isTouch ? 'min-h-[44px] py-2.5 px-3' : 'py-1.5 px-2.5 min-h-[30px]';

  return (
    <div
      ref={menuRef}
      className={`system-action-menu absolute right-0 bottom-full mb-2 w-56 rounded-lg border border-gray-300 bg-white/95 backdrop-blur-md p-2 shadow-xl z-50 text-xs ${className}`}
    >
      <div className="px-2 py-1 border-b border-gray-200 mb-1 flex items-center justify-between font-bold text-gray-700">
        <span>⚡ System Actions</span>
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
          {theme}
        </span>
      </div>

      <div className="space-y-1">
        {actionItems.map(({ action, placement }) => {
          const labelText = action.label[language] ?? action.label.en ?? action.id;
          const isFrozen = placement?.frozen;
          const noteText = placement?.note;

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => !isFrozen && handleExecute(action.id)}
              disabled={isFrozen || !action.enabled}
              className={`w-full text-left flex items-center justify-between rounded transition-colors ${itemHeight} ${
                isFrozen
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                  : 'hover:bg-blue-50 text-gray-800 active:bg-blue-100 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-medium truncate">{labelText}</span>
              </div>
              {isFrozen && (
                <span className="text-[9px] bg-gray-200 text-gray-600 px-1 py-0.5 rounded font-mono">
                  Frozen
                </span>
              )}
              {noteText && (
                <span className="text-[9px] text-gray-400 italic truncate max-w-[80px]">
                  {noteText}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
