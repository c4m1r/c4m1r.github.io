import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { useApp } from '../../contexts/useApp';
import { type ThemeId } from '../../contexts/appContextTypes';
import { translations } from '../../i18n/translations';
import { loadMarkdownContent } from '../../lib/loadMarkdownContent';
import { DesktopStartMenuSurface } from './components/DesktopStartMenuSurface';
import { DesktopIconGrid } from './components/DesktopIconGrid';
import { DesktopSelectionBox } from './components/DesktopSelectionBox';
import { DesktopContextMenuSurface } from './components/DesktopContextMenuSurface';

import { Window } from '../../apps/desktop/Window';
import { DesktopErrorBox } from './components/DesktopErrorBox';
import { Notepad } from '../../apps/notepad';
import { PictureViewer } from '../../apps/pictureview';
import { ContextMenuItem } from '../../apps/desktop/components';
import { MyComputer } from '../../apps/explorer';
import { Windows7Explorer } from '../../apps/explorer/Windows7Explorer';
import { RunDialog } from './components/RunDialog';
import { Folder, HardDrive, Trash2 } from 'lucide-react';
import { getItemsFromPath, FileSystemItem, loadProjectMarkdown } from '../../utils/FileSystem';
import { resolveFileIcon } from '../../themes/iconResolver';
import { getFileAssociation } from '../../themes/fileAssociations';
import { PROJECT_PLAYLIST } from '../../apps/mediaplayer/playlist';
import { winampController } from '../../system/audio/winampController';
import { markdownToHtml } from '../../domain/content/markdown';
import { parseFrontmatter } from '../../domain/content/frontmatter';
import { useDesktopWindowManager } from './runtime/useDesktopWindowManager';
import { useDesktopIconGridState } from './runtime/useDesktopIconGridState';
import { DoomPlayer } from '../../apps/doom/DoomPlayer';
import { doomVariantMap, DoomVariantId } from '../../apps/doom/config';
import { TaskManager } from '../../apps/TaskManager';
import { LangSwitcher } from '../../apps/langs/LangSwitcher';
import { MyCV } from '../../apps/mycv/MyCV';
import { appRegistry } from './appRegistry';
import {
  DESKTOP_PATH,
  MINESWEEPER_WINDOW_ID,
  XP_FAMILY_THEMES,
  WINDOWS_IMAGE_ICON_THEMES,
} from './desktopConstants';
import { type DesktopIcon, type DesktopShellProps } from './desktopTypes';

// Default Windows 7 taskbar pins: Internet Explorer, Windows Explorer, Media Player.
const WIN7_PINNED_TASKBAR_APPS = [
  { appId: 'internet-explorer', label: 'Internet Explorer', iconKey: 'internetExplorerIcon' },
  { appId: 'my-computer', label: 'Windows Explorer', iconKey: 'folderIcon' },
  { appId: 'windows-media-player', label: 'Windows Media Player', iconKey: 'mediaPlayerIcon' },
] as const;
import { getStoredCustomWallpaper } from './runtime/desktopStorage';
import { resolveAppWindowConfig, resolveRunCommandTarget } from './runtime/desktopAppLauncher';
import { getDesktopOsClassName, isThemeInFamily } from './runtime/shortcutFilters';
import { getViewportSize } from './runtime/windowGeometry';
import { THEME_ASSETS } from '../../themes/webos/themeAssets';
import { THEME_STYLES } from '../../themes/webos/themeStyles';
import { playXpClick } from '../../themes/winxp/xpSoundService';
import { AsciiAurora } from '../../components/effects';
import webosVideoWallpaper from '../../themes/webos/assets/Ascii_Blossom.mp4';
import win2000IeDesktopIcon from '../../themes/win2000/icons/desktop/internet-explorer-32.png';
import win2000ShowDesktopIcon from '../../themes/win2000/icons/quick-launch/show-desktop-16.png';
import win2000IeQuickIcon from '../../themes/win2000/icons/start-menu/internet-explorer-16.png';
import win2000OutlookQuickIcon from '../../themes/win98/icons/network/mailbox-world/16x16-1.png';
import {
  getOsAppTitle,
  getOsSystemLabel,
} from '../os/osSkins';
import { getActiveEdition, getSelectedEditionId } from '../os/osEditions';
import { TaskbarSystemArea } from './components/TaskbarSystemArea';
import { AppleSystemBar } from './components/AppleSystemBar';
import { AppleDock } from './components/AppleDock';
import { AppleControlCenter } from './components/AppleControlCenter';
import { AppleMenuSurface } from './components/AppleMenuSurface';
import { AppleNotificationCenter } from './components/AppleNotificationCenter';
import { AppleSpotlight } from './components/AppleSpotlight';
import { AppleDesktopWidgets, type AppleWidgetVisibility } from './components/AppleDesktopWidgets';
import { WebosDesktopWidgets } from '../../system/widgets/components/WebosDesktopWidgets';
import { DEFAULT_WIDGETS_VISIBILITY, WEBOS_DEFAULT_WIDGETS_VISIBILITY, WIDGETS_STORAGE_KEY, getStoredWidgetsVisibility, saveStoredWidgetsVisibility, type DesktopWidgetsVisibility } from '../../system/widgets/types';
import { AppleLockScreen } from './components/AppleLockScreen';
import { AppleWidgetGallery } from './components/AppleWidgetGallery';
import { VistaSidebar } from './components/VistaSidebar';
import { vistaText } from '../../i18n/vistaStrings';
import { IosAssistiveTouch } from './components/IosAssistiveTouch';
import { AppleDesktopViewOptions } from './components/AppleDesktopViewOptions';
import { IosHomeScreen } from './components/IosHomeScreen';
import { getDesktopOsAttributes } from './runtime/desktopOsAttributes';
import { getSystemSettings, subscribeSystemSettings } from '../../system/settings/settingsStore';
import { useDesktopSystemActionBridge } from './runtime/useDesktopSystemActionBridge';
import { MACOS_APP_ICON_BY_ID, MACOS_DOCK_ITEMS, type AppleDockAsset } from './appleIconAssets';

/**
 * Unified DesktopShellContainer component owned by src/shells/desktop.
 * All desktop runtime state, hooks, and presentation surfaces are managed here.
 */

const joinWindowsPath = (parent: string, child: string) => {
  if (!parent || parent === 'My Computer') {
    return child;
  }
  if (parent.endsWith('\\')) {
    return `${parent}${child}`;
  }
  if (parent.endsWith(':')) {
    return `${parent}\\${child}`;
  }
  return `${parent}\\${child}`;
};

export function DesktopShellContainer(props?: DesktopShellProps) {
  const { onSystemCommand } = props ?? {};
  const { language, theme } = useApp();
  // Windows 2000 paints its taskbar from a 116x28 tile that repeats horizontally.
  const taskbarTile = theme === 'win2000' ? THEME_ASSETS.win2000.taskbarTile : undefined;
  const taskbarTileStyle = taskbarTile ? { backgroundImage: `url(${taskbarTile})`, backgroundRepeat: 'repeat-x', backgroundSize: 'auto 28px' } : undefined;
  const t = translations[language].xp;
  const widgetEntryLabels: Record<string, string> = {
    en: 'Widgets', ru: 'Виджеты', fr: 'Widgets', es: 'Widgets', zh: '小组件', ja: 'ウィジェット', ko: '위젯', be: 'Віджэты', kk: 'Виджеттер',
  };
  const windowsGadgetsLabels: Record<string, string> = {
    en: 'Gadgets', ru: 'Гаджеты', fr: 'Gadgets', es: 'Gadgets', zh: '桌面小工具', ja: 'ガジェット', ko: '가젯', be: 'Гаджэты', kk: 'Гаджеттер',
  };
  const macEditWidgetsLabels: Record<string, string> = {
    en: 'Edit Widgets…', ru: 'Изменить виджеты…', fr: 'Modifier les widgets…', es: 'Editar widgets…', zh: '编辑小组件…', ja: 'ウィジェットを編集…', ko: '위젯 편집…', be: 'Змяніць віджэты…', kk: 'Виджеттерді өңдеу…',
  };

  const [viewport, setViewport] = useState(getViewportSize);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [time, setTime] = useState(new Date());
  const [errorWindow, setErrorWindow] = useState<{ id: string; message: string } | null>(null);
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const [desktopColorScheme, setDesktopColorScheme] = useState<'light' | 'dark'>(() => getSystemSettings().perOs?.[theme]?.colorScheme ?? 'dark');
  const [volumeLevel, setVolumeLevel] = useState(70);
  const [iosBrightnessLevel, setIosBrightnessLevel] = useState(() => {
    if (typeof window === 'undefined') return 78;
    const saved = Number(localStorage.getItem('ios-brightness-level'));
    return Number.isFinite(saved) && saved >= 0 && saved <= 100 ? saved : 78;
  });
  const [macBrightnessLevel, setMacBrightnessLevel] = useState(() => {
    if (typeof window === 'undefined') return 78;
    const saved = Number(localStorage.getItem('macos-brightness-level'));
    return Number.isFinite(saved) && saved >= 20 && saved <= 100 ? saved : 78;
  });
  const [nightModeEnabled, setNightModeEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ios-night-mode-enabled') === 'true';
  });
  const [macNightShiftEnabled, setMacNightShiftEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('macos-night-shift-enabled') === 'true';
  });
  const [showVolumePanel, setShowVolumePanel] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showSystemActionMenu, setShowSystemActionMenu] = useState(false);
  const [showAppleMenu, setShowAppleMenu] = useState(false);
  const [recentAppIds, setRecentAppIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('macos-recent-apps');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((value) => typeof value === 'string').slice(0, 6)
        : [];
    } catch {
      return [];
    }
  });
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showAppleLockScreen, setShowAppleLockScreen] = useState(false);
  const [showAppleWidgetGallery, setShowAppleWidgetGallery] = useState(false);
  // Vista shows the Sidebar by default; the older widget set is the alternative skin picked in the gadget gallery.
  const [vistaSidebarSkin, setVistaSidebarSkin] = useState<boolean>(() => {
    try { return localStorage.getItem('vista-sidebar-skin') !== 'alternative'; } catch { return true; }
  });
  const toggleVistaSidebarSkin = useCallback(() => {
    setVistaSidebarSkin((current) => {
      try { localStorage.setItem('vista-sidebar-skin', current ? 'alternative' : 'sidebar'); } catch { /* keep the session choice */ }
      return !current;
    });
  }, []);
  const [macDockMagnificationEnabled, setMacDockMagnificationEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-dock-magnification-enabled') !== 'false';
  });
  const [macReduceMotionEnabled, setMacReduceMotionEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('macos-reduce-motion-enabled') === 'true';
  });
  const [, setMacDesktopWidgetsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-desktop-widgets-enabled') === 'true';
  });
  const [macClockShowSeconds, setMacClockShowSeconds] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('macos-menu-bar-clock-show-seconds') === 'true';
  });
  const [macDockShowIndicators, setMacDockShowIndicators] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-dock-open-indicators-enabled') !== 'false';
  });
  const [macShowTransientDockApps, setMacShowTransientDockApps] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-dock-transient-apps-enabled') !== 'false';
  });
  const [macClockShowDate, setMacClockShowDate] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-menu-bar-clock-show-date') !== 'false';
  });
  const [macClockShowDay, setMacClockShowDay] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-menu-bar-clock-show-day') !== 'false';
  });
  const [macMenuBarBackground, setMacMenuBarBackground] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-menu-bar-background-enabled') !== 'false';
  });
  const [macClockShowAmPm, setMacClockShowAmPm] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-menu-bar-clock-show-am-pm') !== 'false';
  });
  const [macClockStyle, setMacClockStyle] = useState<'digital' | 'analog'>(() => {
    if (typeof window === 'undefined') return 'digital';
    return localStorage.getItem('macos-menu-bar-clock-style') === 'analog' ? 'analog' : 'digital';
  });
  const [macClockFlashSeparators, setMacClockFlashSeparators] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('macos-menu-bar-clock-flash-separators') === 'true';
  });
  const [showAppleViewOptions, setShowAppleViewOptions] = useState(false);
  const [macDesktopIconScale, setMacDesktopIconScale] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const saved = Number(localStorage.getItem('mac-desktop-icon-scale'));
    return Number.isFinite(saved) && saved >= 0.82 && saved <= 1.18 ? saved : 1;
  });
  const [assistiveTouchEnabled, setAssistiveTouchEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('ios-assistive-touch-enabled') !== 'false';
  });
  const [appleWidgetVisibility, setAppleWidgetVisibility] = useState<AppleWidgetVisibility>(() => {
    if (typeof window === 'undefined') return { clock: false, battery: false, calendar: false };
    try {
      const saved = localStorage.getItem('desktop-apple-widget-visibility-v2');
      return saved ? { clock: false, battery: false, calendar: false, ...JSON.parse(saved) } : { clock: false, battery: false, calendar: false };
    } catch { return { clock: false, battery: false, calendar: false }; }
  });
  const [webosWidgetVisibility, setWebosWidgetVisibility] = useState<DesktopWidgetsVisibility>(() => {
    const isWebOS = theme === 'webos';
    const storageKey = isWebOS ? WIDGETS_STORAGE_KEY : `${WIDGETS_STORAGE_KEY}_${theme}`;
    return getStoredWidgetsVisibility(
      storageKey,
      isWebOS ? WEBOS_DEFAULT_WIDGETS_VISIBILITY : DEFAULT_WIDGETS_VISIBILITY,
    );
  });

  useEffect(() => {
    const isWebOS = theme === 'webos';
    const storageKey = isWebOS ? WIDGETS_STORAGE_KEY : `${WIDGETS_STORAGE_KEY}_${theme}`;
    setWebosWidgetVisibility(getStoredWidgetsVisibility(
      storageKey,
      isWebOS ? WEBOS_DEFAULT_WIDGETS_VISIBILITY : DEFAULT_WIDGETS_VISIBILITY,
    ));
  }, [theme]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
  );
  const desktopRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const startupPlayedRef = useRef<Record<string, boolean>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const menuHoverCooldownRef = useRef<number>(0);

  const [customWallpaper, setCustomWallpaper] = useState<string | null>(getStoredCustomWallpaper);
  const [customWallpaperFit, setCustomWallpaperFit] = useState<'fill' | 'fit' | 'stretch' | 'tile' | 'center'>(() => {
    if (typeof window === 'undefined') return 'fill';
    try {
      const saved = window.localStorage.getItem('desktop-wallpaper-fit');
      return saved === 'fit' || saved === 'stretch' || saved === 'tile' || saved === 'center' ? saved : 'fill';
    } catch {
      return 'fill';
    }
  });
  const [activeEdition, setActiveEdition] = useState(() => getActiveEdition(theme));

  useEffect(() => {
    setActiveEdition(getActiveEdition(theme));
  }, [theme]);

  useEffect(() => {
    const handleEditionChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ profileOrThemeId: string; editionId: string }>;
      if (customEvent.detail?.profileOrThemeId === theme) {
        setActiveEdition(getActiveEdition(theme));
      }
    };
    window.addEventListener('os-edition-changed', handleEditionChange);
    return () => window.removeEventListener('os-edition-changed', handleEditionChange);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'macos-26') {
      setShowSpotlight(false);
      return;
    }

    const handleSpotlightShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.code === 'Space') {
        event.preventDefault();
        setShowSpotlight((current) => !current);
        setShowAppleMenu(false);
        setShowSystemActionMenu(false);
        setShowNotificationPanel(false);
      }
      if (event.key === 'Escape') {
        setShowSpotlight(false);
      }
    };

    window.addEventListener('keydown', handleSpotlightShortcut);
    return () => window.removeEventListener('keydown', handleSpotlightShortcut);
  }, [theme]);

  useEffect(() => {
    const handleDockMagnificationChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacDockMagnificationEnabled(customEvent.detail);
      }
    };
    const handleReduceMotionChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacReduceMotionEnabled(customEvent.detail);
      }
    };
    const handleDesktopWidgetsChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacDesktopWidgetsEnabled(customEvent.detail);
      }
    };
    const handleClockSecondsChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacClockShowSeconds(customEvent.detail);
      }
    };
    const handleDockIndicatorsChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacDockShowIndicators(customEvent.detail);
      }
    };
    const handleTransientDockAppsChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacShowTransientDockApps(customEvent.detail);
      }
    };
    const handleClockDateChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacClockShowDate(customEvent.detail);
      }
    };
    const handleClockDayChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacClockShowDay(customEvent.detail);
      }
    };
    const handleMenuBarBackgroundChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacMenuBarBackground(customEvent.detail);
      }
    };
    const handleClockAmPmChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacClockShowAmPm(customEvent.detail);
      }
    };
    const handleClockStyleChange = (event: Event) => {
      const customEvent = event as CustomEvent<'digital' | 'analog'>;
      if (customEvent.detail === 'digital' || customEvent.detail === 'analog') {
        setMacClockStyle(customEvent.detail);
      }
    };
    const handleClockFlashSeparatorsChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setMacClockFlashSeparators(customEvent.detail);
      }
    };

    window.addEventListener('macos-dock-magnification-changed', handleDockMagnificationChange);
    window.addEventListener('macos-reduce-motion-changed', handleReduceMotionChange);
    window.addEventListener('macos-desktop-widgets-changed', handleDesktopWidgetsChange);
    window.addEventListener('macos-clock-seconds-changed', handleClockSecondsChange);
    window.addEventListener('macos-dock-indicators-changed', handleDockIndicatorsChange);
    window.addEventListener('macos-dock-transient-apps-changed', handleTransientDockAppsChange);
    window.addEventListener('macos-clock-date-changed', handleClockDateChange);
    window.addEventListener('macos-clock-day-changed', handleClockDayChange);
    window.addEventListener('macos-menu-bar-background-changed', handleMenuBarBackgroundChange);
    window.addEventListener('macos-clock-am-pm-changed', handleClockAmPmChange);
    window.addEventListener('macos-clock-style-changed', handleClockStyleChange);
    window.addEventListener('macos-clock-flash-separators-changed', handleClockFlashSeparatorsChange);
    return () => {
      window.removeEventListener('macos-dock-magnification-changed', handleDockMagnificationChange);
      window.removeEventListener('macos-reduce-motion-changed', handleReduceMotionChange);
      window.removeEventListener('macos-desktop-widgets-changed', handleDesktopWidgetsChange);
      window.removeEventListener('macos-clock-seconds-changed', handleClockSecondsChange);
      window.removeEventListener('macos-dock-indicators-changed', handleDockIndicatorsChange);
      window.removeEventListener('macos-dock-transient-apps-changed', handleTransientDockAppsChange);
      window.removeEventListener('macos-clock-date-changed', handleClockDateChange);
      window.removeEventListener('macos-clock-day-changed', handleClockDayChange);
      window.removeEventListener('macos-menu-bar-background-changed', handleMenuBarBackgroundChange);
      window.removeEventListener('macos-clock-am-pm-changed', handleClockAmPmChange);
      window.removeEventListener('macos-clock-style-changed', handleClockStyleChange);
      window.removeEventListener('macos-clock-flash-separators-changed', handleClockFlashSeparatorsChange);
    };
  }, []);

  useEffect(() => {
    const handleAssistiveTouchChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail !== 'boolean') return;
      setAssistiveTouchEnabled(customEvent.detail);
    };

    window.addEventListener('ios-assistive-touch-changed', handleAssistiveTouchChange);
    return () => window.removeEventListener('ios-assistive-touch-changed', handleAssistiveTouchChange);
  }, []);

  useEffect(() => {
    const handleWallpaperChange = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setCustomWallpaper(customEvent.detail || null);
    };
    const handleWallpaperFitChange = (e: Event) => {
      const value = (e as CustomEvent<string>).detail;
      if (value === 'fill' || value === 'fit' || value === 'stretch' || value === 'tile' || value === 'center') {
        setCustomWallpaperFit(value);
      }
    };
    window.addEventListener('wallpaper-changed', handleWallpaperChange);
    window.addEventListener('wallpaper-fit-changed', handleWallpaperFitChange);
    return () => {
      window.removeEventListener('wallpaper-changed', handleWallpaperChange);
      window.removeEventListener('wallpaper-fit-changed', handleWallpaperFitChange);
    };
  }, []);
  const trayRef = useRef<HTMLDivElement | null>(null);

  const themeKey: ThemeId = theme;

  useEffect(() => {
    const syncColorScheme = () => {
      setDesktopColorScheme(getSystemSettings().perOs?.[themeKey]?.colorScheme ?? 'dark');
    };
    syncColorScheme();
    return subscribeSystemSettings(syncColorScheme);
  }, [themeKey]);
  const themeAssets = (THEME_ASSETS as Record<string, typeof THEME_ASSETS.webos>)[themeKey] ?? THEME_ASSETS.webos;
  const fallbackAssets = THEME_ASSETS.webos;
  const resolveAssetPath = (primary?: string, secondary?: string) => primary ?? secondary ?? '';
  const volumeIconSrc = resolveAssetPath(themeAssets.volumeIcon, fallbackAssets.volumeIcon);
  const muteIconSrc = resolveAssetPath(themeAssets.muteIcon, fallbackAssets.muteIcon);
  const fullscreenIconSrc = resolveAssetPath(themeAssets.fullscreenIcon, fallbackAssets.fullscreenIcon);
  const notificationIconSrc = resolveAssetPath(themeAssets.notificationIcon, fallbackAssets.notificationIcon);
  const textDocumentIcon = resolveAssetPath(
    themeAssets.richTextIcon ?? themeAssets.notepadIcon,
    fallbackAssets.richTextIcon ?? fallbackAssets.notepadIcon ?? fallbackAssets.folderIcon
  );
  const themeStyles = (THEME_STYLES as Record<string, (typeof THEME_STYLES)['webos']>)[themeKey] ?? THEME_STYLES.webos;
  const isXpFamily = isThemeInFamily(themeKey, XP_FAMILY_THEMES);
  // Windows-family desktops draw their own pixel-art shell icons. Win98, 2000
  // and 7 used the Lucide fallback before, which is not period-correct.
  const usesThemeImageIcons = isThemeInFamily(themeKey, WINDOWS_IMAGE_ICON_THEMES);
  // Native size per generation: Windows 98/2000 desktops used 32 px icons,
  // Windows 7 used 48 px. XP and WebOS keep their current sizing.
  const desktopIconImageClass = themeKey === 'win7' || themeKey === 'vista'
    ? 'w-12 h-12'
    : themeKey === 'win-98' || themeKey === 'win2000'
      ? 'w-8 h-8'
      : 'w-16 h-16';
  const osClassName = getDesktopOsClassName(themeKey);
  const startLabel = getOsSystemLabel('startButton', t.start ?? 'Start', themeKey, language);
  const startupSound = resolveAssetPath(themeAssets.startupSound, fallbackAssets.startupSound);
  const shutdownSound = resolveAssetPath(themeAssets.shutdownSound, fallbackAssets.shutdownSound);
  const logoffSound = resolveAssetPath(themeAssets.logoffSound, fallbackAssets.logoffSound);
  const uiSoundSet = themeAssets.uiSounds ?? {};
  const fallbackUiSoundSet = fallbackAssets.uiSounds ?? {};
  const closeWindowSound = resolveAssetPath(uiSoundSet.closeWindow, fallbackUiSoundSet?.closeWindow);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setViewport(getViewportSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ensureAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    return audioContextRef.current;
  }, []);

  const playFallbackTone = useCallback(
    (frequency: number, duration = 0.12, gainValue = 0.08, type: OscillatorType = 'triangle') => {
      const ctx = ensureAudioContext();
      if (!ctx) {
        return;
      }

      if (ctx.state === 'suspended') {
        void ctx.resume().catch(() => undefined);
      }

      const startTime = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(gainValue, startTime);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(startTime);
      const endTime = startTime + duration;
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
      oscillator.stop(endTime + 0.05);
    },
    [ensureAudioContext]
  );

  const playSystemSound = useCallback(
    (
      src?: string,
      volume = 0.55,
      fallback?: { frequency: number; duration?: number; gain?: number; type?: OscillatorType }
    ) => {
      const triggerFallback = () => {
        if (!fallback) {
          return;
        }
        playFallbackTone(fallback.frequency, fallback.duration ?? 0.12, fallback.gain ?? 0.08, fallback.type ?? 'triangle');
      };

      if (!src) {
        // Themes without an original sound stay silent rather than playing a synthesized tone.
        return;
      }

      try {
        const audio = new Audio(src);
        audio.volume = volume;
        const handleError = () => {
          audio.removeEventListener('error', handleError);
          triggerFallback();
        };
        audio.addEventListener('error', handleError, { once: true });
        void audio.play().catch(() => {
          audio.removeEventListener('error', handleError);
          triggerFallback();
        });
      } catch {
        triggerFallback();
      }
    },
    [playFallbackTone]
  );
  const menuOpenSound = resolveAssetPath(uiSoundSet.menuOpen, fallbackUiSoundSet?.menuOpen);
  const menuCloseSound = resolveAssetPath(uiSoundSet.menuClose, fallbackUiSoundSet?.menuClose);
  const menuHoverSound = resolveAssetPath(uiSoundSet.menuHover, fallbackUiSoundSet?.menuHover);
  const launchSound = resolveAssetPath(uiSoundSet.launchApp, fallbackUiSoundSet?.launchApp);
  const minimizeSound = resolveAssetPath(uiSoundSet.minimize, fallbackUiSoundSet?.minimize);
  const restoreSound = resolveAssetPath(uiSoundSet.restore, fallbackUiSoundSet?.restore);
  const errorSound = resolveAssetPath(uiSoundSet.error, fallbackUiSoundSet?.error);
  const playLaunchSound = useCallback(() => {
    playSystemSound(launchSound, 0.45, { frequency: 760, duration: 0.14, gain: 0.08 });
  }, [launchSound, playSystemSound]);
  const playMinimizeSound = useCallback(() => {
    playSystemSound(minimizeSound, 0.4, { frequency: 360, duration: 0.12, gain: 0.07 });
  }, [minimizeSound, playSystemSound]);
  const playRestoreSound = useCallback(() => {
    playSystemSound(restoreSound, 0.42, { frequency: 540, duration: 0.12, gain: 0.07 });
  }, [restoreSound, playSystemSound]);
  const playErrorSound = useCallback(() => {
    playSystemSound(errorSound, 0.55, { frequency: 220, duration: 0.28, gain: 0.1, type: 'square' });
  }, [errorSound, playSystemSound]);
  const playCloseWindowSound = useCallback(() => {
    playSystemSound(closeWindowSound, 0.38, { frequency: 480, duration: 0.1, gain: 0.06 });
  }, [closeWindowSound, playSystemSound]);

  const {
    windows,
    openWindow,
    closeWindow,
    updateWindow,
    handleCloseWindow,
    handleMinimizeWindow,
    handleMaximizeWindow,
    handleRestoreWindow,
    handleFocusWindow,
    handleTaskbarWindowClick,
  } = useDesktopWindowManager({
    playCloseWindowSound,
    playMinimizeSound,
    playRestoreSound,
  });
  const focusedWindow = windows.find((window) => window.focused && !window.minimized) ?? null;
  const macPinnedDockAppIds = new Set(
    MACOS_DOCK_ITEMS.map((item) => item.appId).filter((appId): appId is string => Boolean(appId))
  );
  const macTransientDockItems: AppleDockAsset[] = [];
  const macTransientSeen = new Set<string>();

  if (themeKey === 'macos-26') {
    for (const managedWindow of windows) {
      const appId = Object.keys(appRegistry).find((candidate) =>
        managedWindow.id === `app:${candidate}` ||
        managedWindow.id.startsWith(`app:${candidate}-`)
      );
      if (!appId || macPinnedDockAppIds.has(appId) || macTransientSeen.has(appId)) continue;

      const definition = appRegistry[appId];
      if (!definition) continue;

      macTransientSeen.add(appId);
      macTransientDockItems.push({
        id: `transient-${appId}`,
        appId,
        title: getOsAppTitle(appId, definition.title, themeKey, language),
        src: MACOS_APP_ICON_BY_ID[appId],
        glyph: MACOS_APP_ICON_BY_ID[appId] ? undefined : (definition.title[language] ?? definition.title.en).slice(0, 1).toUpperCase(),
      });
    }
  }

  const handleMenuHoverSound = useCallback(() => {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - menuHoverCooldownRef.current < 110) {
      return;
    }
    menuHoverCooldownRef.current = now;
    playSystemSound(menuHoverSound, 0.35, { frequency: 820, duration: 0.08, gain: 0.05 });
  }, [menuHoverSound, playSystemSound]);

  const openStartMenu = useCallback(() => {
    let didOpen = false;
    setShowStartMenu((prev) => {
      if (!prev) {
        didOpen = true;
        return true;
      }
      return prev;
    });
    if (didOpen) {
      playSystemSound(menuOpenSound, 0.42, { frequency: 700, duration: 0.11, gain: 0.07 });
    }
  }, [menuOpenSound, playSystemSound]);

  const closeStartMenu = useCallback(() => {
    let didClose = false;
    setShowStartMenu((prev) => {
      if (prev) {
        didClose = true;
        return false;
      }
      return prev;
    });
    if (didClose) {
      playSystemSound(menuCloseSound, 0.42, { frequency: 520, duration: 0.1, gain: 0.07 });
    }
  }, [menuCloseSound, playSystemSound]);

  useEffect(() => {
    if (!startupSound) {
      return;
    }

    if (!startupPlayedRef.current[themeKey]) {
      // The startup sound plays here, when the desktop appears after logon, and nowhere else.
      playSystemSound(startupSound, 0.5);
      startupPlayedRef.current[themeKey] = true;
    }
  }, [startupSound, playSystemSound, themeKey]);

  const handleSystemCommand = useCallback(
    (command: 'logoff' | 'shutdown') => {
      if (command === 'shutdown') {
        playSystemSound(shutdownSound, 0.6);
      } else {
        playSystemSound(logoffSound, 0.6);
      }
      onSystemCommand?.(command);
    },
    [shutdownSound, logoffSound, playSystemSound, onSystemCommand]
  );

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => undefined);
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const handleVolumeToggle = useCallback(() => {
    setShowVolumePanel((prev) => !prev);
    setShowNotificationPanel(false);
  }, []);

  const handleNotificationToggle = useCallback(() => {
    setShowNotificationPanel((prev) => !prev);
    setShowVolumePanel(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, []);

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        setShowVolumePanel(false);
        setShowNotificationPanel(false);
        setShowSystemActionMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        setShowRunDialog(true);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        setShowTaskManager(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getIconElement = (iconType: 'folder' | 'computer' | 'recycle' | 'documents') => {
    // Win98, 2000 and 7 have a dedicated My Documents picture; XP keeps its folder.
    if (iconType === 'documents' && ['win-98', 'win2000', 'win7', 'vista'].includes(themeKey)) {
      const documentsPath = themeAssets.placesIcons?.myDocuments ?? themeAssets.folderIcon;
      if (documentsPath) {
        return <img src={documentsPath} alt="" className={desktopIconImageClass} onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
      }
    }
    if (usesThemeImageIcons) {
      const icons = {
        folder: themeAssets.folderIcon,
        documents: themeAssets.folderIcon,
        computer: themeAssets.computerIcon,
        recycle: themeAssets.recycleIcon,
      };
      const iconPath = icons[iconType];
      if (iconPath) {
        return <img src={iconPath} alt="" className={desktopIconImageClass} onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
      }
    }
    switch (iconType) {
      case 'folder':
        return <Folder size={64} />;
      case 'computer':
        return <HardDrive size={64} />;
      case 'recycle':
        return <Trash2 size={64} />;
    }
  };

  // Games and Programs have dedicated canonical desktop icons above; the FileSystem also
  // exposes legacy targetPath shortcuts for compatibility, so do not render those twice.
  const desktopItems = getItemsFromPath(DESKTOP_PATH).filter(
    (item) => !['игры', 'программы'].includes(item.name.trim().toLocaleLowerCase()),
  );

  const initialDesktopIcons: DesktopIcon[] = [
    ...(themeKey === 'macos-26'
      ? []
      : [
          // Windows 2000 lists My Documents first, then My Computer; the other skins keep My Computer first.
          ...(() => {
            const computer = {
              id: 'my-computer',
              icon: getIconElement('computer'),
              label: getOsSystemLabel('myComputer', t.myComputer, themeKey, language),
              type: 'system' as const,
            };
            const documents = {
              id: 'my-documents',
              icon: getIconElement('documents'),
              label: getOsSystemLabel('documents', language === 'ru' ? 'Мои документы' : 'My Documents', themeKey, language),
              type: 'system' as const,
            };
            return themeKey === 'win2000' ? [documents, computer] : [computer, documents];
          })(),
          ...(['win-xp', 'win-98', 'win2000', 'win7', 'vista'].includes(themeKey) ? [{
            id: 'recycle-bin',
            icon: getIconElement('recycle'),
            label: getOsSystemLabel('recycleBin', language === 'ru' ? 'Корзина' : 'Recycle Bin', themeKey, language),
            type: 'system' as const,
          }] : []),
          ...(themeKey === 'win2000' ? [{
            id: 'internet-explorer',
            icon: <img src={win2000IeDesktopIcon} alt="" className={desktopIconImageClass} />,
            label: 'Internet Explorer',
            type: 'system' as const,
          }] : []),
          {
            id: 'games-folder',
            icon: getIconElement('folder'),
            label: language === 'ru' ? 'Игры' : 'Games',
            type: 'system' as const,
          },
          {
            id: 'programs-folder',
            icon: getIconElement('folder'),
            label: language === 'ru' ? 'Программы' : 'Programs',
            type: 'system' as const,
          },
        ]),
    ...desktopItems.map(item => ({
      id: item.id,
      icon: item.appId ? (
        <img
          src={resolveFileIcon(item, theme)}
          alt=""
          className="w-16 h-16 object-contain drop-shadow"
          onError={(e) => {
            e.currentTarget.src = item.type === 'folder'
              ? resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon)
              : textDocumentIcon;
          }}
        />
      ) : item.icon && typeof item.icon === 'string' ? (
        <img
          src={item.icon}
          alt=""
          className={`w-16 h-16 ${item.name === 'Bliss.jpg' ? 'object-cover border-2 border-white shadow-md' : ''}`}
          onError={(e) => {
            e.currentTarget.src = item.type === 'folder'
              ? resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon)
              : textDocumentIcon;
          }}
        />
      ) : (
        <img
          src={item.type === 'folder'
            ? resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon)
            : textDocumentIcon}
          alt=""
          className="w-16 h-16"
        />
      ),
      label: item.name,
      type: (item.type === 'folder' ? 'folder' : 'system') as 'folder' | 'system'
    }))
  ];

  const {
    desktopIcons,
    selectedIcons,
    setSelectedIcons,
    draggingIcon,
    selectionBox,
    handleDesktopMouseDown,
    handleIconMouseDown,
    clearSelection,
    cleanUpIcons,
    sortDesktopIcons,
  } = useDesktopIconGridState({
    initialDesktopIcons,
    viewport,
    desktopRef,
    iconRefs,
    onCloseStartMenu: closeStartMenu,
    classicLayout: themeKey === 'win-98' || themeKey === 'win2000',
    flowRecycleBin: themeKey === 'vista',
  });

  const handleOpenFile = useCallback(async (item: FileSystemItem, parentPath: string) => {
    const fullPath = joinWindowsPath(parentPath, item.name);
    if (item.mediaTrackId) {
      const trackIndex = PROJECT_PLAYLIST.findIndex((track) => track.id === item.mediaTrackId);
      if (trackIndex >= 0) {
        winampController.setTrack(trackIndex);
        void winampController.play();
        window.dispatchEvent(new CustomEvent('app:launch', { detail: { appId: 'winamp' } }));
      }
      return;
    }
    if (item.appId) {
      window.dispatchEvent(new CustomEvent('app:launch', { detail: { appId: item.appId } }));
      return;
    }
    let content: React.ReactNode | null = null;
    let title = item.name;
    let width = 640;
    let height = 480;

    if (item.id === 'about-me') {
      content = <MyCV />;
      title = 'My CV';
      width = 720;
      height = 540;
    }

    const lowerName = item.name.toLowerCase();
    const fileAssociation = getFileAssociation(item.name);
    if (lowerName.endsWith('.md') && item.id.startsWith('project:')) {
      let markdown = typeof item.content === 'string' ? item.content : '';
      if (markdown.endsWith('.md') && !markdown.includes('\n')) {
        try {
          markdown = await loadProjectMarkdown(markdown);
        } catch (error) {
          console.warn('Failed to load project article:', error);
          playErrorSound();
          return;
        }
      }
      const parsed = parseFrontmatter(markdown, language);
      content = (
        <div className="h-full overflow-auto bg-white px-6 py-5 text-slate-900">
          <article className="prose prose-sm mx-auto max-w-4xl" dangerouslySetInnerHTML={{ __html: markdownToHtml(parsed.body) }} />
        </div>
      );
      title = parsed.metadata.title || item.name.replace(/\.md$/i, '');
      width = 820;
      height = 620;
    } else if (lowerName.endsWith('.md') || ['text', 'code', 'data'].includes(fileAssociation?.category ?? '')) {
      let fileContent = item.content || '';

      if (typeof fileContent === 'string' && fileContent.endsWith('.md') && !fileContent.includes('\n')) {
        try {
          const markdownContent = await loadMarkdownContent(fileContent);
          fileContent = markdownContent;
        } catch (error) {
          console.warn('Failed to load markdown content:', error);
          fileContent = `Failed to load ${fileContent}`;
        }
      }

      content = <Notepad initialContent={fileContent} />;
      title = themeKey === 'macos-26'
        ? `${item.name} - TextEdit`
        : themeKey.startsWith('ios-')
          ? `${item.name} - Notes`
          : `${item.name} - Notepad`;
    } else if (fileAssociation?.category === 'image' || /\.(png|jpg|jpeg|gif|webp)$/i.test(lowerName)) {
      if (typeof item.content === 'string') {
        content = <PictureViewer initialImage={item.content} />;
        title = themeKey === 'macos-26'
          ? `${item.name} - Preview`
          : themeKey.startsWith('ios-')
            ? `${item.name} - Photos`
            : `${item.name} - Picture Viewer`;
      }
    }

    if (!content) {
      playErrorSound();
      return;
    }

    const iconPath = resolveFileIcon(item, theme);

    openWindow({
      id: `file:${fullPath}`,
      title,
      content,
      icon: typeof iconPath === 'string' ? iconPath : undefined,
      width,
      height,
    });
    playLaunchSound();
  }, [openWindow, playErrorSound, playLaunchSound, themeKey, language]);

  const handleOpenPictureSlideshow = useCallback((items: FileSystemItem[]) => {
    const images = items.flatMap((item) => (
      typeof item.content === 'string' ? [{ src: item.content, name: item.name }] : []
    ));
    if (images.length === 0) return;
    openWindow({
      id: `slideshow:${Date.now()}`,
      title: language === 'ru' ? 'Просмотр изображений — слайд-шоу' : 'Picture Viewer — Slide Show',
      icon: resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon),
      width: 720,
      height: 520,
      content: <PictureViewer images={images} startSlideshow />,
    });
    playLaunchSound();
  }, [language, openWindow, playLaunchSound, themeAssets.folderIcon, fallbackAssets.folderIcon]);

  const openExplorerWindow = useCallback((path: string, initialSearchOpen = false) => {
    const normalizedPath = path || 'My Computer';
    const pathName = normalizedPath.split('\\').filter(Boolean).pop() || normalizedPath;
    const localizedFolderNames: Record<string, string> = language === 'ru'
      ? { 'My Documents': 'Мои документы', 'My Pictures': 'Мои рисунки', 'My Music': 'Моя музыка', '$Recycle.Bin': 'Корзина' }
      : { '$Recycle.Bin': 'Recycle Bin' };
    const title = normalizedPath === 'My Computer'
      ? (themeKey === 'win7' || themeKey === 'vista' ? (language === 'ru' ? 'Компьютер' : 'Computer') : t.myComputer)
      : localizedFolderNames[pathName] ?? pathName;

    openWindow({
      id: initialSearchOpen ? `explorer:search-${Date.now()}` : `explorer:${normalizedPath}`,
      title,
      icon: normalizedPath === 'My Computer'
        ? themeAssets.computerIcon
        : normalizedPath === 'C:\\$Recycle.Bin' ? themeAssets.recycleIcon : themeAssets.folderIcon,
      // New windows open at (100, 100) and cascade by 30 px; leave room for that so a 640x480 screen does not clip it.
      width: Math.min(720, Math.max(320, viewport.width - 140)),
      height: Math.min(520, Math.max(240, viewport.height - 180)),
      content: themeKey === 'win7'
        ? <Windows7Explorer currentPath={normalizedPath} onOpenItem={handleOpenFile} onOpenSlideshow={handleOpenPictureSlideshow} />
        : <MyComputer currentPath={normalizedPath} onOpenItem={handleOpenFile} onOpenSlideshow={handleOpenPictureSlideshow} initialSearchOpen={initialSearchOpen} />,
    });
    playLaunchSound();
  }, [handleOpenFile, handleOpenPictureSlideshow, language, openWindow, playLaunchSound, t.myComputer, themeAssets.computerIcon, themeAssets.folderIcon, themeAssets.recycleIcon, themeKey, viewport.width, viewport.height]);

  const openDoomVariant = useCallback((variantId: DoomVariantId) => {
    const variant = doomVariantMap[variantId];
    if (!variant) {
      playErrorSound();
      return;
    }

    openWindow({
      id: `app:doom-${variantId}`,
      title: variant.title,
      icon: variant.icon,
      width: variant.window.width,
      height: variant.window.height,
      content: <DoomPlayer variantId={variantId} />,
    });
    playLaunchSound();
  }, [openWindow, playLaunchSound, playErrorSound]);

  const openGamesFolder = useCallback(() => {
    openExplorerWindow('C:\\Users\\C4m1r\\Desktop\\Игры');
  }, [openExplorerWindow]);

  const recordRecentApp = useCallback((appId: string) => {
    setRecentAppIds((current) => {
      const next = [appId, ...current.filter((id) => id !== appId)].slice(0, 6);
      localStorage.setItem('macos-recent-apps', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleOpenPictureFromGallery = useCallback((imagePath: string) => {
    openWindow({
      id: `picture:${imagePath}`,
      title: imagePath.split('/').pop() || 'Picture',
      icon: resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon),
      width: 720,
      height: 520,
      content: <PictureViewer initialImage={imagePath} />,
    });
  }, [openWindow, themeAssets.folderIcon, fallbackAssets.folderIcon]);

  const launchApp = useCallback((appId: string) => {
    const config = resolveAppWindowConfig(
      appRegistry,
      appId,
      themeAssets as unknown as Record<string, string | undefined>,
      language,
      textDocumentIcon
    );

    if (!config) {
      switch (appId) {
        case 'run':
          setShowRunDialog(true);
          playLaunchSound();
          recordRecentApp('run');
          break;
        case 'search':
          openExplorerWindow('My Computer', true);
          recordRecentApp('search');
          break;
        case 'my-computer':
          openExplorerWindow('My Computer');
          recordRecentApp('my-computer');
          break;
        case 'network-neighborhood':
          openExplorerWindow('Network Neighborhood');
          recordRecentApp('network-neighborhood');
          break;
        case 'widget-gallery':
          setShowAppleWidgetGallery(true);
          break;
        case 'games-folder':
          openExplorerWindow('C:\\Users\\C4m1r\\Desktop\\Игры');
          recordRecentApp('games-folder');
          break;
        case 'all-programs':
          openExplorerWindow('C:\\Program Files');
          recordRecentApp('all-programs');
          break;
        case 'doom1':
        case 'doom2':
        case 'doom3':
          openDoomVariant(appId as DoomVariantId);
          recordRecentApp(appId);
          break;
        default:
          playErrorSound();
          setErrorWindow({
            id: `error-${Date.now()}`,
            message: `Windows cannot find '${appId.replace('unavailable:', '')}'. Make sure you typed the name correctly, and then try again.`,
          });
          console.warn(`[StartMenu] Unknown app requested: ${appId}`);
      }
      return;
    }

    recordRecentApp(appId);

    const Component = config.app.component;
    let content: React.ReactNode = null;

    if (appId === 'minesweeper') {
      content = <Component onClose={() => closeWindow(MINESWEEPER_WINDOW_ID)} />;
    } else if (appId === 'pictures') {
      content = <Component onOpenImage={handleOpenPictureFromGallery} />;
    } else if (appId === 'winamp') {
      content = <Component onClose={() => closeWindow(config.windowId)} />;
    } else if (appId === 'notepad') {
      openWindow({
        id: config.windowId,
        title: config.title,
        icon: config.iconSrc || textDocumentIcon,
        width: config.width,
        height: config.height,
        content: <Component initialContent="" />,
      });
      playLaunchSound();
      return;
    } else if (appId === 'task-manager') {
      setShowTaskManager(true);
      playLaunchSound();
      return;
    } else {
      content = <Component />;
    }

    openWindow({
      id: config.windowId,
      title: config.title,
      icon: config.iconSrc,
      width: config.width,
      height: config.height,
      resizable: config.resizable,
      content,
    });
    playLaunchSound();
  }, [
    openWindow,
    closeWindow,
    playLaunchSound,
    playErrorSound,
    themeAssets,
    language,
    textDocumentIcon,
    handleOpenPictureFromGallery,
    openExplorerWindow,
    openGamesFolder,
    openDoomVariant,
    recordRecentApp,
  ]);

  useEffect(() => {
    const handleAppLaunch = (event: Event) => {
      const appId = (event as CustomEvent<{ appId?: string }>).detail?.appId;
      if (appId) launchApp(appId);
    };
    const handleOpenWidgetGallery = () => setShowAppleWidgetGallery(true);
    const handleOpenExplorerPath = (event: Event) => {
      const path = (event as CustomEvent<{ path?: string }>).detail?.path;
      if (path) openExplorerWindow(path);
    };
    window.addEventListener('app:launch', handleAppLaunch);
    window.addEventListener('desktop:open-widget-gallery', handleOpenWidgetGallery);
    window.addEventListener('explorer:open-path', handleOpenExplorerPath);
    return () => {
      window.removeEventListener('app:launch', handleAppLaunch);
      window.removeEventListener('desktop:open-widget-gallery', handleOpenWidgetGallery);
      window.removeEventListener('explorer:open-path', handleOpenExplorerPath);
    };
  }, [launchApp, openExplorerWindow]);

  useEffect(() => {
    if (themeKey !== 'macos-26') return;

    const handleMacWindowShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        Boolean(target?.isContentEditable);

      if (isTypingTarget) return;
      if (!event.metaKey || event.ctrlKey || event.shiftKey) return;

      const key = event.key.toLowerCase();

      if (event.altKey) {
        if (key === 'h' && focusedWindow) {
          event.preventDefault();
          windows
            .filter((window) => window.id !== focusedWindow.id && !window.minimized)
            .forEach((window) => handleMinimizeWindow(window.id));
        }
        return;
      }

      if (key === 'q' && focusedWindow) {
        event.preventDefault();
        handleCloseWindow(focusedWindow.id);
        return;
      }

      if (key === 'w' && focusedWindow) {
        event.preventDefault();
        handleCloseWindow(focusedWindow.id);
        return;
      }

      if (key === 'm' && focusedWindow) {
        event.preventDefault();
        handleMinimizeWindow(focusedWindow.id);
        return;
      }

      if (key === 'h' && focusedWindow) {
        event.preventDefault();
        handleMinimizeWindow(focusedWindow.id);
        return;
      }

      if (key === ',' ) {
        event.preventDefault();
        launchApp('control-panel');
        return;
      }

      if (key === 'n' && (!focusedWindow || focusedWindow.id.startsWith('explorer:'))) {
        event.preventDefault();
        openExplorerWindow('My Computer');
        return;
      }

      if ((key === '1' || key === '2') && focusedWindow?.id.startsWith('explorer:')) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('webos:finder-view', {
          detail: {
            windowId: focusedWindow.id,
            mode: key === '1' ? 'icons' : 'list',
          },
        }));
      }
    };

    window.addEventListener('keydown', handleMacWindowShortcut);
    return () => window.removeEventListener('keydown', handleMacWindowShortcut);
  }, [
    focusedWindow,
    handleCloseWindow,
    handleMinimizeWindow,
    launchApp,
    openExplorerWindow,
    themeKey,
    windows,
  ]);

  const handleRunCommand = useCallback((command: string) => {
    const appId = resolveRunCommandTarget(command);
    if (appId) {
      launchApp(appId);
    } else {
      playErrorSound();
      setErrorWindow({
        id: `error-run-${Date.now()}`,
        message: `Windows cannot find '${command}'. Make sure you typed the name correctly, and then try again.`
      });
    }
  }, [launchApp, playErrorSound]);

  const openPathFromMenu = useCallback((path: string) => {
    openExplorerWindow(path);
  }, [openExplorerWindow]);

  const handleIconDoubleClick = (icon: DesktopIcon) => {
    switch (icon.id) {
      case 'my-computer':
        openExplorerWindow('My Computer');
        return;
      case 'my-documents':
        openExplorerWindow('C:\\Documents and Settings\\C4m1r\\My Documents');
        return;
      case 'programs-folder':
        openExplorerWindow('C:\\Users\\C4m1r\\Desktop\\Программы');
        return;
      case 'widget-gallery':
        window.dispatchEvent(new CustomEvent('desktop:open-widget-gallery'));
        return;
      case 'recycle-bin':
        if (['win-xp', 'win-98', 'win2000', 'win7', 'vista'].includes(themeKey)) {
          openExplorerWindow('C:\\$Recycle.Bin');
          return;
        }
        playErrorSound();
        setErrorWindow({
          id: `error-${Date.now()}`,
          message: `C:\\\nApplication not found`
        });
        return;
      default:
        if (icon.id.startsWith('shortcut-')) {
          const appId = icon.id.replace('shortcut-', '');
          launchApp(appId);
          return;
        }
        if (appRegistry[icon.id] || icon.id === 'games-folder') {
          launchApp(icon.id);
          return;
        }
        
        {
          const item = desktopItems.find(i => i.id === icon.id);
          if (!item) return;
          if (item.type === 'folder') {
            openExplorerWindow(joinWindowsPath(DESKTOP_PATH, item.name));
          } else if (item.type === 'file') {
            handleOpenFile(item, DESKTOP_PATH);
          }
        }
    }
  };

  const handleIconContextMenu = useCallback(
    (e: React.MouseEvent, icon: DesktopIcon) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedIcons.includes(icon.id)) {
        setSelectedIcons([icon.id]);
      }
      closeStartMenu();
      const items: ContextMenuItem[] = themeKey.startsWith('ios-')
        ? [
            { label: 'Open', onClick: () => handleIconDoubleClick(icon) },
            { separator: true },
            { label: 'App Info', onClick: () => launchApp('control-panel') },
            {
              label: 'Edit Home Screen',
              onClick: () => window.dispatchEvent(new CustomEvent('ios-home-edit')),
            },
            {
              label: 'Remove from Home Screen',
              onClick: () => window.dispatchEvent(new CustomEvent('ios-home-remove', {
                detail: { iconId: icon.id },
              })),
            },
          ]
        : [
            { label: 'Open', onClick: () => handleIconDoubleClick(icon) },
            { separator: true },
            { label: 'Cut', disabled: true },
            { label: 'Copy', disabled: true },
            { separator: true },
            { label: 'Create Shortcut', disabled: true },
            { label: 'Delete', disabled: true },
            { label: 'Rename', disabled: true },
            { separator: true },
            { label: 'Properties', disabled: true },
          ];

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        items,
      });
    },
    [selectedIcons, closeStartMenu, handleIconDoubleClick, launchApp, setSelectedIcons, themeKey]
  );

  const osAttributes = getDesktopOsAttributes(themeKey);

  useDesktopSystemActionBridge({
    onOpenSettings: () => launchApp('control-panel'),
    onOpenAbout: () => launchApp('about'),
  });

  return (
    <div
      ref={desktopRef}
      {...osAttributes}
      data-color-scheme={themeKey === 'webos' ? desktopColorScheme : undefined}
      className={`${themeStyles.body.join(' ')} ${themeKey === 'vista' && ['starter', 'home-basic'].includes(getSelectedEditionId('vista')) ? 'vista-basic' : ''} min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden os-shell os-${osClassName} os-desktop`}
      style={{
        backgroundImage: customWallpaper
          ? `url(${customWallpaper})`
          : activeEdition?.wallpaper
          ? `url(${activeEdition.wallpaper})`
          : (isXpFamily || themeKey === 'vista') && themeAssets.wallpaper
          ? `url(${themeAssets.wallpaper})`
          : undefined,
        backgroundColor: customWallpaper
          ? 'transparent'
          : activeEdition?.backgroundColor
          ? activeEdition.backgroundColor
          : isXpFamily
          ? 'transparent'
          : themeKey === 'win-98'
          ? '#008080'
          : themeKey === 'win2000'
          ? '#3a6ea5'
          : themeKey === 'ubuntu'
          ? '#2c001e'
          : themeKey === 'arch'
          ? '#1e222b'
          : themeKey === 'halloween'
          ? '#12041d'
          : themeKey === 'webos'
          ? '#0f172a'
          : 'transparent',
        backgroundSize: customWallpaperFit === 'fill' ? 'cover' : customWallpaperFit === 'fit' ? 'contain' : customWallpaperFit === 'stretch' ? '100% 100%' : 'auto',
        backgroundRepeat: customWallpaperFit === 'tile' ? 'repeat' : 'no-repeat',
        backgroundPosition: 'center',
        paddingBottom: '30px',
        '--ios-screen-dim': themeKey.startsWith('ios-')
          ? String(Math.max(0, Math.min(0.55, ((100 - iosBrightnessLevel) / 100) * 0.55)))
          : '0',
        '--ios-night-shift': themeKey.startsWith('ios-') && nightModeEnabled ? '0.14' : '0',
        '--mac-desktop-icon-scale': themeKey === 'macos-26' ? String(macDesktopIconScale) : '1',
        '--mac-screen-dim': themeKey === 'macos-26'
          ? String(Math.max(0, Math.min(0.48, ((100 - macBrightnessLevel) / 100) * 0.48)))
          : '0',
        '--mac-night-shift': themeKey === 'macos-26' && macNightShiftEnabled ? '0.13' : '0',
      } as CSSProperties}
      onMouseDown={handleDesktopMouseDown}
      onClick={(event) => {
        closeStartMenu();
        setContextMenu(null);
        if (desktopRef.current && event.target === desktopRef.current) {
          clearSelection();
        }
      }}
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.os-window')) {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu(null);
          return;
        }
        e.preventDefault();
        closeStartMenu();
        if (themeKey.startsWith('ios-')) {
          setContextMenu(null);
          return;
        }
        const desktopMenuItems: ContextMenuItem[] = themeKey === 'macos-26'
          ? [
              { label: 'New Folder', disabled: true },
              { separator: true },
              { label: 'Get Info', disabled: true },
              {
                label: 'Change Desktop Background…',
                onClick: () => launchApp('control-panel'),
              },
              { separator: true },
              { label: 'Use Stacks', disabled: true },
              {
                label: 'Sort By',
                submenu: [
                  { label: 'Name', onClick: () => sortDesktopIcons('name') },
                  { label: 'Kind', onClick: () => sortDesktopIcons('kind') },
                  { label: 'Date Modified', disabled: true },
                  { label: 'Size', disabled: true },
                ],
              },
              { label: 'Clean Up', onClick: cleanUpIcons },
              {
                label: 'Show View Options',
                onClick: () => setShowAppleViewOptions(true),
              },
              {
                label: macEditWidgetsLabels[language] ?? macEditWidgetsLabels.en,
                onClick: () => setShowAppleWidgetGallery(true),
              },
            ]
          : [
              {
                label: 'Arrange Icons By', submenu: [
                  { label: 'Name' },
                  { label: 'Size' },
                  { label: 'Type' },
                  { label: 'Modified' },
                  { separator: true },
                  { label: 'Auto Arrange' },
                  { label: 'Align to Grid' },
                ]
              },
              { label: 'Refresh', onClick: () => { } },
              { separator: true },
              { label: 'Paste', disabled: true },
              { separator: true },
              {
                label: 'New', submenu: [
                  { label: 'Folder' },
                  { label: 'Shortcut' },
                  { separator: true },
                  { label: 'Text Document' },
                ]
              },
              { separator: true },
              ...(themeKey === 'win7'
                ? [{
                    label: windowsGadgetsLabels[language] ?? windowsGadgetsLabels.en,
                    onClick: () => setShowAppleWidgetGallery(true),
                  }]
                : themeKey.startsWith('win')
                  ? []
                  : [{
                      label: widgetEntryLabels[language] ?? widgetEntryLabels.en,
                      onClick: () => setShowAppleWidgetGallery(true),
                    }]),
              { label: 'Properties' },
            ];

        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: desktopMenuItems,
        });
      }}
    >
      {/* WebOS Animated MP4 Video Wallpaper */}
      {themeKey === 'webos' && !customWallpaper && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
          src={webosVideoWallpaper}
        />
      )}

      <AppleSystemBar
        theme={themeKey}
        language={language}
        time={time}
        activeAppTitle={focusedWindow?.title}
        activeWindowId={focusedWindow?.id}
        clockShowSeconds={macClockShowSeconds}
        clockShowDate={macClockShowDate}
        clockShowDay={macClockShowDay}
        menuBarBackground={macMenuBarBackground}
        clockShowAmPm={macClockShowAmPm}
        clockStyle={macClockStyle}
        clockFlashSeparators={macClockFlashSeparators}
        onAppleMenuToggle={() => {
          setShowAppleMenu((prev) => !prev);
          setShowSystemActionMenu(false);
          closeStartMenu();
        }}
        onControlCenterToggle={() => {
          setShowSystemActionMenu((prev) => !prev);
          setShowAppleMenu(false);
          closeStartMenu();
          setShowVolumePanel(false);
          setShowNotificationPanel(false);
        }}
        onNotificationCenterToggle={() => {
          const supportsAppleNotifications =
            themeKey === 'macos-26' || (themeKey.startsWith('ios-') && themeKey !== 'ios-5');
          if (!supportsAppleNotifications) return;
          setShowNotificationPanel((prev) => !prev);
          setShowSystemActionMenu(false);
          setShowAppleMenu(false);
          setShowSpotlight(false);
          closeStartMenu();
          setShowVolumePanel(false);
        }}
        onSpotlightToggle={() => {
          if (themeKey !== 'macos-26') return;
          setShowSpotlight((prev) => !prev);
          setShowSystemActionMenu(false);
          setShowAppleMenu(false);
          setShowNotificationPanel(false);
          closeStartMenu();
        }}
        onOpenSettings={() => launchApp('control-panel')}
        onOpenAbout={() => launchApp('about')}
        onHideActiveApp={() => {
          if (focusedWindow) handleMinimizeWindow(focusedWindow.id);
        }}
        onHideOtherApps={() => {
          if (!focusedWindow) return;
          windows
            .filter((window) => window.id !== focusedWindow.id && !window.minimized)
            .forEach((window) => handleMinimizeWindow(window.id));
        }}
        canQuitActiveApp={Boolean(focusedWindow)}
        onQuitActiveApp={() => {
          if (focusedWindow) handleCloseWindow(focusedWindow.id);
        }}
        onNewFinderWindow={() => openExplorerWindow('My Computer')}
        onCloseActiveWindow={() => {
          if (focusedWindow) handleCloseWindow(focusedWindow.id);
        }}
        onMinimizeActiveWindow={() => {
          if (focusedWindow) handleMinimizeWindow(focusedWindow.id);
        }}
        onZoomActiveWindow={() => {
          if (!focusedWindow) return;
          if (focusedWindow.maximized) handleRestoreWindow(focusedWindow.id);
          else handleMaximizeWindow(focusedWindow.id);
        }}
        onOpenFinderPath={(path) => openExplorerWindow(path)}
        onFinderViewMode={(mode) => {
          if (!focusedWindow?.id.startsWith('explorer:')) return;
          window.dispatchEvent(new CustomEvent('webos:finder-view', {
            detail: { windowId: focusedWindow.id, mode },
          }));
        }}
        onFinderToggleBar={(bar) => {
          if (!focusedWindow?.id.startsWith('explorer:')) return;
          window.dispatchEvent(new CustomEvent('webos:finder-bar-toggle', {
            detail: { windowId: focusedWindow.id, bar },
          }));
        }}
        onOpenHelp={() => launchApp('help')}
      />

      <AppleWidgetGallery
        themeKey={themeKey}
        open={showAppleWidgetGallery}
        visibility={appleWidgetVisibility}
        webosVisibility={webosWidgetVisibility}
        vistaSidebarSkin={vistaSidebarSkin}
        onToggleVistaSkin={toggleVistaSidebarSkin}
        classicWinampOpen={windows.some((managedWindow) => managedWindow.id === 'app:winamp')}
        onToggleClassicWinamp={() => {
          if (windows.some((managedWindow) => managedWindow.id === 'app:winamp')) closeWindow('app:winamp');
          else launchApp('winamp');
        }}
        onClose={() => setShowAppleWidgetGallery(false)}
        onToggle={(key) => {
          if (themeKey === 'webos') {
            setWebosWidgetVisibility((current) => {
              const next = { ...current, [key]: !current[key as keyof DesktopWidgetsVisibility] };
              saveStoredWidgetsVisibility(next, themeKey === 'webos' ? WIDGETS_STORAGE_KEY : `${WIDGETS_STORAGE_KEY}_${themeKey}`);
              return next;
            });
            return;
          }
          setAppleWidgetVisibility((current) => {
            const next = { ...current, [key]: !current[key] };
            localStorage.setItem('desktop-apple-widget-visibility-v2', JSON.stringify(next));
            return next;
          });
        }}
        onPresetChange={(key, presetId) => {
          const widgetId = themeKey === 'webos'
            ? (key === 'clock' ? 'clockCalendar' : key)
            : (key === 'clock' || key === 'calendar') && appleWidgetVisibility.clock && appleWidgetVisibility.calendar
              ? 'clockCalendar'
              : key;
          window.dispatchEvent(new CustomEvent('desktop-widget-preset-change', { detail: { widgetId, presetId } }));
        }}
      />

      {themeKey === 'macos-26' && (
        <AppleDesktopViewOptions
          open={showAppleViewOptions}
          iconScale={macDesktopIconScale}
          onClose={() => setShowAppleViewOptions(false)}
          onIconScaleChange={(value) => {
            const next = Math.max(0.82, Math.min(1.18, value));
            setMacDesktopIconScale(next);
            localStorage.setItem('mac-desktop-icon-scale', String(next));
          }}
        />
      )}

      {themeKey === 'macos-26' && (
        <AppleSpotlight
          open={showSpotlight}
          onClose={() => setShowSpotlight(false)}
          onLaunchApp={(appId) => launchApp(appId)}
        />
      )}

      {(themeKey === 'macos-26' || (themeKey.startsWith('ios-') && themeKey !== 'ios-5')) && (
        <AppleNotificationCenter
          open={showNotificationPanel}
          theme={themeKey}
          time={time}
          language={language}
          onClose={() => setShowNotificationPanel(false)}
          onOpenCalendar={() => launchApp('calendar')}
        />
      )}

      {themeKey === 'macos-26' && (
        <AppleMenuSurface
          open={showAppleMenu}
          onClose={() => setShowAppleMenu(false)}
          onOpenAbout={() => launchApp('about')}
          onOpenSettings={() => launchApp('control-panel')}
          recentItems={recentAppIds.map((appId) => {
            const definition = appRegistry[appId];
            if (definition) {
              return {
                id: appId,
                title: getOsAppTitle(appId, definition.title, themeKey, language),
              };
            }
            const specialTitles: Record<string, string> = {
              run: 'Run',
              'my-computer': 'Finder',
              'games-folder': 'Games',
              'all-programs': 'Applications',
              doom1: 'DOOM',
              doom2: 'DOOM II',
              doom3: 'DOOM 3',
            };
            return { id: appId, title: specialTitles[appId] ?? appId };
          })}
          onOpenRecent={(appId) => launchApp(appId)}
          canForceQuit={Boolean(focusedWindow)}
          onForceQuit={() => {
            if (focusedWindow) handleCloseWindow(focusedWindow.id);
          }}
          onLockScreen={() => {
            setShowAppleLockScreen(true);
            setShowAppleMenu(false);
            setShowSpotlight(false);
            setShowNotificationPanel(false);
            setShowSystemActionMenu(false);
          }}
          onLogOut={() => handleSystemCommand('logoff')}
          onShutdown={() => handleSystemCommand('shutdown')}
        />
      )}

      {(themeKey === 'macos-26' || (themeKey.startsWith('ios-') && themeKey !== 'ios-5')) && (
        <AppleLockScreen
          open={showAppleLockScreen}
          theme={themeKey}
          time={time}
          language={language}
          onUnlock={() => setShowAppleLockScreen(false)}
        />
      )}

      {themeKey.startsWith('ios-') && themeKey !== 'ios-5' && (
        <IosAssistiveTouch
          enabled={assistiveTouchEnabled}
          onHome={() => {
            windows.forEach((window) => handleCloseWindow(window.id));
            setShowSystemActionMenu(false);
            setShowNotificationPanel(false);
            closeStartMenu();
          }}
          onOpenSettings={() => launchApp('control-panel')}
          onOpenControlCenter={() => {
            setShowSystemActionMenu(true);
            setShowNotificationPanel(false);
            closeStartMenu();
          }}
          onOpenNotifications={() => {
            setShowNotificationPanel(true);
            setShowSystemActionMenu(false);
            closeStartMenu();
          }}
          onToggleFullscreen={toggleFullscreen}
          onLock={() => {
            setShowAppleLockScreen(true);
            setShowSystemActionMenu(false);
            setShowNotificationPanel(false);
            closeStartMenu();
          }}
        />
      )}

      {(themeKey === 'macos-26' || (themeKey.startsWith('ios-') && themeKey !== 'ios-5')) && (
        <AppleControlCenter
          theme={themeKey}
          open={showSystemActionMenu}
          volumeLevel={volumeLevel}
          brightnessLevel={themeKey === 'macos-26' ? macBrightnessLevel : iosBrightnessLevel}
          nightModeEnabled={nightModeEnabled}
          macNightShiftEnabled={macNightShiftEnabled}
          isFullscreen={isFullscreen}
          onClose={() => setShowSystemActionMenu(false)}
          onVolumeLevelChange={setVolumeLevel}
          onBrightnessLevelChange={(value) => {
            if (themeKey === 'macos-26') {
              setMacBrightnessLevel(value);
              localStorage.setItem('macos-brightness-level', String(value));
              window.dispatchEvent(new CustomEvent('macos-brightness-changed', { detail: value }));
            } else {
              setIosBrightnessLevel(value);
              localStorage.setItem('ios-brightness-level', String(value));
              window.dispatchEvent(new CustomEvent('ios-brightness-changed', { detail: value }));
            }
          }}
          onNightModeChange={(value) => {
            setNightModeEnabled(value);
            localStorage.setItem('ios-night-mode-enabled', String(value));
            window.dispatchEvent(new CustomEvent('ios-night-mode-changed', { detail: value }));
          }}
          onMacNightShiftChange={(value) => {
            setMacNightShiftEnabled(value);
            localStorage.setItem('macos-night-shift-enabled', String(value));
            window.dispatchEvent(new CustomEvent('macos-night-shift-changed', { detail: value }));
          }}
          onFullscreenToggle={toggleFullscreen}
          onOpenSettings={() => {
            setShowSystemActionMenu(false);
            launchApp('control-panel');
          }}
          onOpenAbout={() => {
            setShowSystemActionMenu(false);
            launchApp('about');
          }}
          onLaunchApp={(appId) => {
            setShowSystemActionMenu(false);
            launchApp(appId);
          }}
        />
      )}

      {theme === 'ubuntu' && (
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <AsciiAurora variant="ubuntu" opacity={0.18} columns={110} rows={36} frameInterval={110} speed={0.52} />
        </div>
      )}
      {theme === 'webos' && (
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <AsciiAurora variant="webos" opacity={0.14} columns={104} rows={34} frameInterval={105} speed={0.62} />
        </div>
      )}

      {themeKey.startsWith('ios-') ? (
        <IosHomeScreen
          theme={themeKey}
          desktopIcons={desktopIcons}
          selectedIcons={selectedIcons}
          onIconDoubleClick={handleIconDoubleClick}
          onIconContextMenu={handleIconContextMenu}
        />
      ) : (
        <DesktopIconGrid
          desktopIcons={desktopIcons}
          selectedIcons={selectedIcons}
          draggingIcon={draggingIcon}
          iconRefs={iconRefs}
          isXpFamily={isXpFamily}
          themeKey={themeKey}
          onIconMouseDown={handleIconMouseDown}
          onIconDoubleClick={handleIconDoubleClick}
          onIconContextMenu={handleIconContextMenu}
        />
      )}

      <DesktopSelectionBox
        selectionBox={selectionBox}
        themeKey={themeKey}
      />

      {themeKey === 'vista' && vistaSidebarSkin && (
        <VistaSidebar
          time={time}
          language={language}
          onOpenGallery={() => setShowAppleWidgetGallery(true)}
          onOpenNews={() => launchApp('news')}
          onOpenCalendar={() => launchApp('calendar')}
        />
      )}

      {themeKey !== 'webos' && !(themeKey === 'vista' && vistaSidebarSkin) && Object.values(appleWidgetVisibility).some(Boolean) && (
        <AppleDesktopWidgets
          time={time}
          language={language}
          visibility={appleWidgetVisibility}
          themeKey={themeKey}
          onOpenNews={() => launchApp('news')}
          onOpenGalleryImage={() => launchApp('pictures')}
          onOpenCalendar={() => launchApp('calendar')}
        />
      )}

      {themeKey === 'webos' && (
        <WebosDesktopWidgets
          onOpenFeed={() => launchApp('news')}
          onOpenGalleryImage={() => launchApp('pictures')}
          onOpenCalendar={() => launchApp('calendar')}
        />
      )}

      {windows.map((window) => {
        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            initialX={window.x}
            initialY={window.y}
            width={window.width}
            height={window.height}
            minimized={window.minimized}
            maximized={window.maximized}
            zIndex={window.zIndex}
            focused={window.focused}
            onClose={() => handleCloseWindow(window.id)}
            onMinimize={() => handleMinimizeWindow(window.id)}
            onMaximize={() => handleMaximizeWindow(window.id)}
            onRestore={() => handleRestoreWindow(window.id)}
            onFocus={() => handleFocusWindow(window.id)}
            onDragEnd={(position) => updateWindow(window.id, position)}
            onResizeEnd={(size) => updateWindow(window.id, size)}
          >
            {window.content}
          </Window>
        );
      })}

      {
        errorWindow && (
          <Window
            key={errorWindow.id}
            id={errorWindow.id}
            title="C:\\"
            initialX={window.innerWidth / 2 - 190}
            initialY={window.innerHeight / 2 - 60}
            onClose={() => setErrorWindow(null)}
            width={380}
            height={135}
            minimized={false}
            maximized={false}
            zIndex={1000}
            focused={true}
          >
            <DesktopErrorBox
              message={errorWindow.message}
              onClose={() => setErrorWindow(null)}
            />
          </Window>
        )
      }

      {/* Taskbar */}
      <div
        className={`taskbar fixed bottom-0 left-0 right-0 flex items-center justify-start shadow-lg z-50 os-statusbar ${themeStyles.taskbar.join(' ')}`}
        style={taskbarTileStyle}
      >
        <div className="taskbar__inner">
          <AppleDock
            theme={themeKey}
            launcherOpen={showStartMenu}
            onLauncherToggle={() => {
              if (showStartMenu) closeStartMenu();
              else openStartMenu();
            }}
            onLaunchApp={launchApp}
            openWindowIds={windows.map((window) => window.id)}
            magnificationEnabled={macDockMagnificationEnabled && !macReduceMotionEnabled}
            bounceEnabled={!macReduceMotionEnabled}
            showRunningIndicators={macDockShowIndicators}
            transientItems={macShowTransientDockApps ? macTransientDockItems : []}
            onQuitApp={(appId) => {
              windows
                .filter((window) => {
                  if (appId === 'my-computer') return window.id === 'explorer:My Computer';
                  return window.id === `app:${appId}` || window.id.startsWith(`app:${appId}-`);
                })
                .forEach((window) => handleCloseWindow(window.id));
            }}
          />
          {/* Start Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (theme === 'win-xp') {
                playXpClick();
              }
              if (showStartMenu) {
                closeStartMenu();
              } else {
                openStartMenu();
              }
            }}
            className={`start-button flex items-center gap-1 h-full relative os-button ${(showStartMenu ? themeStyles.startButtonOpen : themeStyles.startButton).join(' ')}`}
          >
            {isXpFamily ? (
              <>
                {themeAssets.startButtonIcon && (
                  <img
                    src={themeAssets.startButtonIcon}
                    alt="Windows"
                    className="start-button__icon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="start-button__label">
                  {startLabel}
                </span>
              </>
            ) : (
              <>
                {themeAssets.startButtonIcon && (
                  <img src={themeAssets.startButtonIcon} alt="" className="h-4 w-4 object-contain" />
                )}
                <span className="text-black font-bold text-sm">{t.start ?? 'Start'}</span>
              </>
            )}
          </button>

          {/* Windows 2000 quick launch: Show Desktop, Internet Explorer, Outlook Express. */}
          {themeKey === 'win2000' && (
            <>
              <div className="taskbar-divider" aria-hidden />
              <div className="taskbar-quick-launch flex items-center flex-shrink-0" style={{ gap: 2, padding: '0 3px' }}>
                {[
                  { id: 'show-desktop', label: language === 'ru' ? 'Свернуть все окна' : 'Show Desktop', icon: win2000ShowDesktopIcon, run: () => windows.forEach((w) => { if (!w.minimized) handleMinimizeWindow(w.id); }) },
                  { id: 'internet-explorer', label: language === 'ru' ? 'Запуск Internet Explorer' : 'Launch Internet Explorer Browser', icon: win2000IeQuickIcon, run: () => launchApp('internet-explorer') },
                  { id: 'outlook', label: language === 'ru' ? 'Запуск Outlook Express' : 'Launch Outlook Express', icon: win2000OutlookQuickIcon, run: () => launchApp('outlook') },
                ].map((item) => (
                  <button key={item.id} type="button" className="flex items-center justify-center bg-transparent border-0 p-0" style={{ width: 22, height: 22 }} title={item.label} aria-label={item.label} onClick={item.run}>
                    <img src={item.icon} alt="" width={16} height={16} style={{ imageRendering: 'pixelated' }} />
                  </button>
                ))}
              </div>
              <div className="taskbar-divider" aria-hidden />
            </>
          )}

          {/* Windows Vista quick launch: Show Desktop, Internet Explorer, Windows Media Player, Windows Mail. */}
          {themeKey === 'vista' && (
            <>
              <div className="taskbar-divider" aria-hidden />
              <div className="taskbar-quick-launch flex items-center flex-shrink-0" style={{ gap: 3, padding: '0 4px' }}>
                {[
                  { id: 'show-desktop', label: vistaText(language, 'showDesktop'), icon: win2000ShowDesktopIcon, run: () => windows.forEach((w) => { if (!w.minimized) handleMinimizeWindow(w.id); }) },
                  { id: 'internet-explorer', label: 'Internet Explorer', icon: themeAssets.internetExplorerIcon, run: () => launchApp('internet-explorer') },
                  { id: 'windows-media-player', label: 'Windows Media Player', icon: themeAssets.mediaPlayerIcon, run: () => launchApp('windows-media-player') },
                  { id: 'outlook', label: vistaText(language, 'windowsMail'), icon: themeAssets.mailIcon, run: () => launchApp('outlook') },
                ].filter((item) => Boolean(item.icon)).map((item) => (
                  <button key={item.id} type="button" className="vista-quick-launch__button" title={item.label} aria-label={item.label} onClick={item.run}>
                    <img src={item.icon} alt="" width={16} height={16} />
                  </button>
                ))}
              </div>
              <div className="taskbar-divider" aria-hidden />
            </>
          )}

          {/* Window List Area */}
          <div className="taskbar-windows flex-1 overflow-hidden">
            {themeKey === 'win7' && WIN7_PINNED_TASKBAR_APPS.map((pinned) => (
              <button
                key={`pinned-${pinned.appId}`}
                onClick={() => launchApp(pinned.appId)}
                className="taskbar-button taskbar-button--pinned flex-shrink-0 select-none os-button"
                title={pinned.label}
                aria-label={pinned.label}
              >
                {themeAssets[pinned.iconKey] && (
                  <img
                    src={themeAssets[pinned.iconKey] as string}
                    alt=""
                    className="taskbar-button__icon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </button>
            ))}
            {windows.map((window) => (
              <button
                key={window.id}
                onClick={() => handleTaskbarWindowClick(window)}
                className={`taskbar-button flex-shrink-0 truncate max-w-[170px] select-none os-button ${window.focused ? 'is-active' : ''} ${window.minimized ? 'is-minimized' : ''}`}
                title={window.title}
              >
                {window.icon && (
                  <img
                    src={window.icon}
                    alt=""
                    className="taskbar-button__icon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="taskbar-button__label">{window.title}</span>
              </button>
            ))}
          </div>

          <div className="taskbar-divider" aria-hidden />

          {/* Notification Tray / Clock */}
          <div ref={trayRef} className={`taskbar-tray ${themeStyles.systemTray.join(' ')}`}>
          <TaskbarSystemArea
            language={language}
            isXpFamily={isXpFamily}
            trayRef={trayRef}
            volumeLevel={volumeLevel}
            showVolumePanel={showVolumePanel}
            showNotificationPanel={showNotificationPanel}
            showSystemActionMenu={showSystemActionMenu}
            onVolumeToggle={handleVolumeToggle}
            onNotificationToggle={handleNotificationToggle}
            onSystemActionToggle={() => {
              setShowSystemActionMenu((prev) => !prev);
              setShowVolumePanel(false);
              setShowNotificationPanel(false);
            }}
            onVolumeLevelChange={(val) => setVolumeLevel(val)}
            isFullscreen={isFullscreen}
            onFullscreenToggle={toggleFullscreen}
            time={time}
            volumeIconSrc={volumeIconSrc}
            muteIconSrc={muteIconSrc}
            fullscreenIconSrc={fullscreenIconSrc}
            notificationIconSrc={notificationIconSrc}
            trayExpandIconSrc={themeAssets.trayExpandIcon}
            onOpenCalendar={() => launchApp('calendar')}
            languageSlot={<LangSwitcher variant="tray" buttonClassName="taskbar-tray-icon taskbar-lang-button" />}
          />
        </div>
      </div>
      </div>

      <div
        className="pointer-events-auto"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <DesktopStartMenuSurface
          isOpen={showStartMenu}
          onClose={closeStartMenu}
          onLaunchApp={launchApp}
          onOpenPath={openPathFromMenu}
          onSystemCommand={(command) => {
            handleSystemCommand(command);
          }}
          onHover={handleMenuHoverSound}
        />
      </div>

      <DesktopContextMenuSurface
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        themeKey={themeKey}
      />

      {showRunDialog && (
        <RunDialog
          onClose={() => setShowRunDialog(false)}
          onRun={handleRunCommand}
        />
      )}

      {showTaskManager && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40" onClick={() => setShowTaskManager(false)}>
          <div className="w-[600px] h-[500px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-full flex flex-col">
              <div className={`${isXpFamily ? 'bg-gradient-to-r from-[#0054e3] to-[#0a5fef]' : 'bg-gradient-to-r from-[#000080] to-[#1084d0]'} text-white px-2 py-1 flex justify-between`}>
                <span className="text-sm font-bold">Windows Task Manager</span>
                <button onClick={() => setShowTaskManager(false)} className="text-white hover:bg-white/20 px-2">×</button>
              </div>
              <div className="flex-1">
                <TaskManager 
                  windows={windows.map(w => ({ id: w.id, title: w.title }))} 
                  onEndTask={(id) => {
                    handleCloseWindow(id);
                    if (windows.length <= 1) {
                      setShowTaskManager(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
