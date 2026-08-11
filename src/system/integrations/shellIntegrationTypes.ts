import { type SystemActionId } from '../actions/systemActionTypes';

export type ShellSurface =
  | 'site-navbar'
  | 'tray'
  | 'panel-indicator'
  | 'dock'
  | 'control-center'
  | 'settings'
  | 'control-panel'
  | 'start-menu'
  | 'status-bar';

export interface ShellActionPlacement {
  actionId: SystemActionId;
  surfaces: ShellSurface[];
  priority?: number;
  touchFriendly?: boolean;
  showLabel?: boolean;
  frozen?: boolean;
  note?: string;
}

export interface TouchAffordanceMetadata {
  pointerMode: 'mouse' | 'touch' | 'hybrid';
  touchFriendly: boolean;
  minHitTargetPx: number;
  supportsLongPress?: boolean;
  supportsSwipeGesture?: boolean;
  supportsHover?: boolean;
}

export interface ShellIntegrationRules {
  shellId: string;
  profileId?: string;
  themeId?: string;
  placements: ShellActionPlacement[];
  touchMetadata?: TouchAffordanceMetadata;
}
