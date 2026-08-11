import {
  type ShellIntegrationRules,
  type TouchAffordanceMetadata,
} from './shellIntegrationTypes';

export const DEFAULT_MOUSE_TOUCH_METADATA: TouchAffordanceMetadata = {
  pointerMode: 'mouse',
  touchFriendly: false,
  minHitTargetPx: 24,
  supportsHover: true,
};

export const DEFAULT_IOS_TOUCH_METADATA: TouchAffordanceMetadata = {
  pointerMode: 'touch',
  touchFriendly: true,
  minHitTargetPx: 44,
  supportsLongPress: true,
  supportsSwipeGesture: true,
  supportsHover: false,
};

export const shellIntegrationsRegistry: Record<string, ShellIntegrationRules> = {
  site: {
    shellId: 'site-shell',
    profileId: 'site',
    touchMetadata: DEFAULT_MOUSE_TOUCH_METADATA,
    placements: [
      { actionId: 'language.toggle', surfaces: ['site-navbar'], priority: 1, showLabel: true },
      { actionId: 'effects.fireworks', surfaces: ['site-navbar'], priority: 2, showLabel: false },
      { actionId: 'settings.open', surfaces: ['site-navbar'], priority: 3, showLabel: true },
    ],
  },

  'win-xp': {
    shellId: 'desktop-shell',
    themeId: 'win-xp',
    profileId: 'win-xp',
    touchMetadata: DEFAULT_MOUSE_TOUCH_METADATA,
    placements: [
      { actionId: 'language.toggle', surfaces: ['tray'], priority: 1, showLabel: true },
      { actionId: 'effects.fireworks', surfaces: ['tray'], priority: 2, showLabel: false },
      { actionId: 'settings.open', surfaces: ['control-panel', 'start-menu'], priority: 3, showLabel: true },
      { actionId: 'settings.reset', surfaces: ['control-panel'], priority: 4, showLabel: true },
    ],
  },

  'win-98': {
    shellId: 'desktop-shell',
    themeId: 'win-98',
    profileId: 'win-98',
    touchMetadata: DEFAULT_MOUSE_TOUCH_METADATA,
    placements: [
      { actionId: 'language.toggle', surfaces: ['tray'], priority: 1, showLabel: true },
      { actionId: 'effects.fireworks', surfaces: ['tray'], priority: 2, showLabel: false },
      { actionId: 'settings.open', surfaces: ['control-panel', 'start-menu'], priority: 3, showLabel: true },
      { actionId: 'settings.reset', surfaces: ['control-panel'], priority: 4, showLabel: true },
    ],
  },

  win7: {
    shellId: 'desktop-shell',
    themeId: 'win7',
    profileId: 'win7',
    touchMetadata: DEFAULT_MOUSE_TOUCH_METADATA,
    placements: [
      { actionId: 'language.toggle', surfaces: ['tray'], priority: 1, showLabel: true },
      { actionId: 'effects.fireworks', surfaces: ['tray'], priority: 2, showLabel: false },
      { actionId: 'settings.open', surfaces: ['control-panel', 'start-menu'], priority: 3, showLabel: true },
      { actionId: 'settings.reset', surfaces: ['control-panel'], priority: 4, showLabel: true },
    ],
  },

  ubuntu: {
    shellId: 'desktop-shell',
    themeId: 'ubuntu',
    profileId: 'ubuntu',
    touchMetadata: DEFAULT_MOUSE_TOUCH_METADATA,
    placements: [
      { actionId: 'language.toggle', surfaces: ['panel-indicator'], priority: 1, showLabel: true },
      { actionId: 'effects.fireworks', surfaces: ['panel-indicator'], priority: 2, showLabel: false },
      { actionId: 'settings.open', surfaces: ['settings', 'panel-indicator'], priority: 3, showLabel: true },
      { actionId: 'settings.reset', surfaces: ['settings'], priority: 4, showLabel: true },
    ],
  },

  webos: {
    shellId: 'desktop-shell',
    themeId: 'webos',
    profileId: 'webos',
    touchMetadata: DEFAULT_MOUSE_TOUCH_METADATA,
    placements: [
      { actionId: 'language.toggle', surfaces: ['tray'], priority: 1, showLabel: true },
      { actionId: 'effects.fireworks', surfaces: ['tray'], priority: 2, showLabel: false },
      { actionId: 'settings.open', surfaces: ['control-panel'], priority: 3, showLabel: true },
      { actionId: 'settings.reset', surfaces: ['control-panel'], priority: 4, showLabel: true },
    ],
  },

  'ios-26': {
    shellId: 'ios-shell',
    themeId: 'ios-26',
    profileId: 'ios-26',
    touchMetadata: DEFAULT_IOS_TOUCH_METADATA,
    placements: [
      { actionId: 'language.toggle', surfaces: ['control-center', 'settings'], priority: 1, touchFriendly: true, showLabel: true },
      { actionId: 'effects.fireworks', surfaces: ['control-center', 'dock'], priority: 2, touchFriendly: true, showLabel: false },
      { actionId: 'settings.open', surfaces: ['settings', 'control-center'], priority: 3, touchFriendly: true, showLabel: true },
      { actionId: 'settings.reset', surfaces: ['settings'], priority: 4, touchFriendly: true, showLabel: true },
    ],
  },

  'ios-16': {
    shellId: 'ios-shell',
    themeId: 'ios-16',
    profileId: 'ios-16',
    touchMetadata: DEFAULT_IOS_TOUCH_METADATA,
    placements: [
      { actionId: 'language.toggle', surfaces: ['control-center', 'settings'], priority: 1, touchFriendly: true, showLabel: true },
      { actionId: 'effects.fireworks', surfaces: ['control-center', 'dock'], priority: 2, touchFriendly: true, showLabel: false },
      { actionId: 'settings.open', surfaces: ['settings', 'control-center'], priority: 3, touchFriendly: true, showLabel: true },
      { actionId: 'settings.reset', surfaces: ['settings'], priority: 4, touchFriendly: true, showLabel: true },
    ],
  },

  'ios-9': {
    shellId: 'ios-shell',
    themeId: 'ios-9',
    profileId: 'ios-9',
    touchMetadata: DEFAULT_IOS_TOUCH_METADATA,
    placements: [
      { actionId: 'language.toggle', surfaces: ['control-center', 'settings'], priority: 1, touchFriendly: true, showLabel: true },
      { actionId: 'effects.fireworks', surfaces: ['control-center', 'dock'], priority: 2, touchFriendly: true, showLabel: false },
      { actionId: 'settings.open', surfaces: ['settings', 'control-center'], priority: 3, touchFriendly: true, showLabel: true },
      { actionId: 'settings.reset', surfaces: ['settings'], priority: 4, touchFriendly: true, showLabel: true },
    ],
  },

  'ios-5': {
    shellId: 'ios-shell',
    themeId: 'ios-5',
    profileId: 'ios-5',
    touchMetadata: DEFAULT_IOS_TOUCH_METADATA,
    placements: [
      { actionId: 'language.toggle', surfaces: ['settings'], priority: 1, touchFriendly: true, showLabel: true },
      { actionId: 'effects.fireworks', surfaces: ['dock'], priority: 2, touchFriendly: true, showLabel: false },
      { actionId: 'settings.open', surfaces: ['settings'], priority: 3, touchFriendly: true, showLabel: true },
      { actionId: 'settings.reset', surfaces: ['settings'], priority: 4, touchFriendly: true, showLabel: true },
    ],
  },
};

export function getShellIntegrationRules(themeOrProfileId: string): ShellIntegrationRules {
  return (
    shellIntegrationsRegistry[themeOrProfileId] ??
    shellIntegrationsRegistry.site
  );
}
