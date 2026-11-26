/**
 * Per-OS stylesheet sets.
 *
 * Global files (tokens, os-base, shared components) stay in `index.css`. Every OS-specific
 * stylesheet is loaded here, only for the OS whose desktop is on screen, so Windows 98 does not
 * download the macOS or iOS CSS. Halloween is a child of Windows XP: it loads the whole XP set
 * and then its own file on top.
 *
 * Each list keeps the order the files had in the global index, so the cascade is unchanged.
 */

type StyleLoader = () => Promise<unknown>;

const css = {
  classic: () => import('./themes/classic.css'),
  xpShared: () => import('./themes/xp-shared.css'),
  xp98: () => import('./themes/xp-98.css'),
  xpWinxp: () => import('./themes/xp-winxp.css'),
  xpWebos: () => import('./themes/xp-webos.css'),
  winxp: () => import('./themes/winxp.css'),
  winxpFidelity: () => import('./themes/winxp-fidelity.css'),
  winxpStartmenu: () => import('./themes/winxp-startmenu-fidelity.css'),
  winxpTrayClock: () => import('./themes/winxp-tray-clock.css'),
  winxpExplorer: () => import('./themes/winxp-explorer-fidelity.css'),
  winxpAuthenticity: () => import('./themes/winxp-authenticity-pass.css'),
  winxpWin7Fidelity: () => import('./themes/windows-xp-win7-fidelity-pass.css'),
  windowsNativeApp: () => import('./themes/windows-native-app-final.css'),
  windowsShellFidelity: () => import('./themes/windows-shell-fidelity-final.css'),
  bootSessionFidelity: () => import('./themes/boot-session-fidelity-final.css'),
  win7: () => import('./themes/win7.css'),
  vista: () => import('./themes/vista.css'),
  vistaStartMenu: () => import('./themes/vista-startmenu.css'),
  ubuntu: () => import('./themes/ubuntu.css'),
  arch: () => import('./themes/arch.css'),
  halloween: () => import('./themes/halloween.css'),
  webos: () => import('./themes/webos.css'),
  macos: () => import('./themes/macos.css'),
  appleDock: () => import('./themes/apple-dock.css'),
  appleLauncher: () => import('./themes/apple-launcher.css'),
  appleApps: () => import('./themes/apple-apps.css'),
  ios: () => import('./themes/ios.css'),
  buildWatermark: () => import('./themes/windows-build-watermark.css'),
  calendar: () => import('./themes/calendar-os-adapters.css'),
} satisfies Record<string, StyleLoader>;

const WINXP_SET: StyleLoader[] = [
  css.xpWinxp,
  css.winxp,
  css.winxpFidelity,
  css.winxpStartmenu,
  css.winxpTrayClock,
  css.macos,
  css.winxpExplorer,
  css.winxpAuthenticity,
  css.winxpWin7Fidelity,
  css.windowsNativeApp,
  css.bootSessionFidelity,
  css.calendar,
];

/** Stylesheet set per OS class. The key is the first matching `os-*` class of the skin. */
const OS_STYLE_SETS: Record<string, StyleLoader[]> = {
  'os-winxp': WINXP_SET,
  // Halloween is a child of Windows XP: the whole XP set, then its own file last.
  'os-spooky': [...WINXP_SET, css.halloween],
  'os-classic': [css.xp98, css.classic, css.macos, css.buildWatermark, css.calendar],
  'os-win7': [
    css.win7,
    css.macos,
    css.winxpWin7Fidelity,
    css.windowsNativeApp,
    css.windowsShellFidelity,
    css.bootSessionFidelity,
    css.buildWatermark,
    css.calendar,
  ],
  // Windows Vista: the Windows 7 set with the Vista overrides on top.
  'os-vista': [
    css.win7,
    css.macos,
    css.winxpWin7Fidelity,
    css.windowsNativeApp,
    css.windowsShellFidelity,
    css.bootSessionFidelity,
    css.buildWatermark,
    css.calendar,
    css.vistaStartMenu,
    css.vista,
  ],
  'os-ubuntu': [css.ubuntu, css.macos, css.calendar],
  'os-arch': [css.arch, css.macos, css.calendar],
  'os-macos': [css.macos, css.appleDock, css.appleLauncher, css.appleApps],
  'os-ios': [css.ios, css.appleDock, css.appleLauncher, css.appleApps, css.calendar],
  'os-win10': [css.calendar, css.macos],
  'os-win11': [css.calendar, css.macos],
  'os-webos': [css.xpWebos, css.webos, css.calendar],
};

/** Priority order when a skin lists several OS classes, e.g. "os-classic os-win2000". */
const CLASS_PRIORITY = [
  'os-spooky',
  'os-winxp',
  'os-classic',
  'os-vista',
  'os-win7',
  'os-ubuntu',
  'os-arch',
  'os-macos',
  'os-ios',
  'os-win10',
  'os-win11',
  'os-webos',
];

/** Picks the stylesheet set key for a skin's `osClassName` (e.g. "os-classic os-win2000"). */
export function osStyleSetKey(osClassName: string): string {
  const classes = osClassName.split(/\s+/);
  return CLASS_PRIORITY.find((cls) => classes.includes(cls)) ?? 'os-webos';
}

const loadedSets = new Map<string, Promise<void>>();

/** Loads the OS stylesheets once per set. Resolves when the CSS is in the document. */
export function loadOsStyleSheets(osClassName: string): Promise<void> {
  const key = osStyleSetKey(osClassName);
  let pending = loadedSets.get(key);
  if (!pending) {
    // Unscoped XP rules (start button parts, tray, welcome and transition screens) apply to every set.
    const loaders = [css.xpShared, ...(OS_STYLE_SETS[key] ?? [])];
    pending = loaders.reduce<Promise<unknown>>(
      (chain, load) => chain.then(() => load()),
      Promise.resolve(),
    ).then(() => undefined);
    loadedSets.set(key, pending);
  }
  return pending;
}
