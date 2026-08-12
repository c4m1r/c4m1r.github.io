import { useApp } from '../../contexts/useApp';
import { useSystemActions } from './useSystemActions';
import { type SystemActionId } from './systemActionTypes';

export interface SystemActionButtonProps {
  actionId: SystemActionId;
  showLabel?: boolean;
  touchFriendly?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function SystemActionButton({
  actionId,
  showLabel = true,
  touchFriendly = false,
  className = '',
  disabled = false,
  onClick,
}: SystemActionButtonProps) {
  const { language } = useApp();
  const { actions, executeAction } = useSystemActions();

  const action = actions.find((a) => a.id === actionId);
  if (!action) return null;

  const labelText = action.label[language] ?? action.label.en ?? actionId;
  const isEnabled = action.enabled && !disabled;

  const handleClick = () => {
    if (!isEnabled) return;
    executeAction(actionId);
    if (onClick) onClick();
  };

  const basePadding = touchFriendly ? 'px-3 py-2 min-h-[44px]' : 'px-2.5 py-1.5 min-h-[28px]';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isEnabled}
      title={labelText}
      className={`system-action-button flex items-center gap-2 rounded transition-colors text-xs font-medium ${basePadding} ${
        isEnabled
          ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 cursor-pointer'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
      } ${className}`}
    >
      {action.iconKey && <span className="text-sm">{action.iconKey}</span>}
      {showLabel && <span className="truncate">{labelText}</span>}
    </button>
  );
}
