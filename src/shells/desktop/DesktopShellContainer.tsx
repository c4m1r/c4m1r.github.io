import { useState, useEffect, useRef, useCallback } from 'react';
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
import { RunDialog } from './components/RunDialog';
import { Folder, HardDrive, Trash2 } from 'lucide-react';
import { getItemsFromPath, getFileIcon, FileSystemItem } from '../../utils/FileSystem';
import { useDesktopWindowManager } from './runtime/useDesktopWindowManager';
import { useDesktopIconGridState } from './runtime/useDesktopIconGridState';
import { DoomPlayer } from '../../apps/doom/DoomPlayer';
import { GamesFolder } from '../../apps/games/GamesFolder';
import { doomVariantMap, DoomVariantId } from '../../apps/doom/config';
import { TaskManager } from '../../apps/TaskManager';
import { LangSwitcher } from '../../apps/langs/LangSwitcher';
import { MyCV } from '../../apps/mycv/MyCV';
import { appRegistry } from './appRegistry';
import { desktopShortcuts } from './shortcutsRegistry';
import {
  DESKTOP_PATH,
  MINESWEEPER_WINDOW_ID,
  XP_FAMILY_THEMES,
} from './desktopConstants';
import { type DesktopIcon, type DesktopShellProps } from './desktopTypes';
import { getStoredCustomWallpaper } from './runtime/desktopStorage';
import { findAppDefinition } from './runtime/appLaunch';
import { resolveAppWindowConfig, resolveRunCommandTarget } from './runtime/desktopAppLauncher';
import { getDesktopOsClassName, isThemeInFamily } from './runtime/shortcutFilters';
import { getViewportSize } from './runtime/windowGeometry';
import { THEME_ASSETS } from '../../themes/webos/themeAssets';
import { THEME_STYLES } from '../../themes/webos/themeStyles';
import { AsciiAurora } from '../../components/effects';
import {
  getOsAppTitle,
  getOsSystemLabel,
} from '../os/osSkins';
import { TaskbarSystemArea } from './components/TaskbarSystemArea';
import { getDesktopOsAttributes } from './runtime/desktopOsAttributes';
import { useDesktopSystemActionBridge } from './runtime/useDesktopSystemActionBridge';

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
  const t = translations[language].xp;
  const [viewport, setViewport] = useState(getViewportSize);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [time, setTime] = useState(new Date());
  const [errorWindow, setErrorWindow] = useState<{ id: string; message: string } | null>(null);
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(70);
  const [showVolumePanel, setShowVolumePanel] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showSystemActionMenu, setShowSystemActionMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
  );
  const desktopRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const startupPlayedRef = useRef<Record<string, boolean>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const menuHoverCooldownRef = useRef<number>(0);

  const [customWallpaper, setCustomWallpaper] = useState<string | null>(getStoredCustomWallpaper);

  useEffect(() => {
    const handleWallpaperChange = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setCustomWallpaper(customEvent.detail || null);
    };
    window.addEventListener('wallpaper-changed', handleWallpaperChange);
    return () => window.removeEventListener('wallpaper-changed', handleWallpaperChange);
  }, []);
  const trayRef = useRef<HTMLDivElement | null>(null);

  const themeKey: ThemeId = theme;
  const themeAssets = THEME_ASSETS[themeKey as unknown as 'webos' | 'win-xp' | 'win-98'] ?? THEME_ASSETS.webos;
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
  const themeStyles = THEME_STYLES[themeKey as unknown as 'webos' | 'win-xp' | 'win-98'] ?? THEME_STYLES.webos;
  const isXpFamily = isThemeInFamily(themeKey, XP_FAMILY_THEMES);
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
        triggerFallback();
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

  const getIconElement = (iconType: 'folder' | 'computer' | 'recycle') => {
    if (isXpFamily) {
      const icons = {
        folder: themeAssets.folderIcon,
        computer: themeAssets.computerIcon,
        recycle: themeAssets.recycleIcon,
      };
      const iconPath = icons[iconType];
      if (iconPath) {
        return <img src={iconPath} alt="" className="w-12 h-12" onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
      }
    }
    switch (iconType) {
      case 'folder':
        return <Folder size={48} />;
      case 'computer':
        return <HardDrive size={48} />;
      case 'recycle':
        return <Trash2 size={48} />;
    }
  };

  const desktopItems = getItemsFromPath(DESKTOP_PATH);
  const gamesLabel = t.games ?? (language === 'ru' ? 'Игры' : 'Games');

  const renderShortcutIcon = (asset?: string, fallback?: string, altText = '') => (
    <img
      src={resolveAssetPath(asset, fallback ?? fallbackAssets.folderIcon)}
      alt={altText}
      className="w-12 h-12 drop-shadow"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );

  const applicationShortcuts: DesktopIcon[] = desktopShortcuts.map((appId) => {
    const app = findAppDefinition(appRegistry, appId);
    if (!app) return null;

    let iconSrc = '';
    if (app.iconKey) {
      iconSrc = themeAssets[app.iconKey as keyof typeof themeAssets] as string;
    }
    if (!iconSrc && app.iconKey === 'richTextIcon') {
      iconSrc = textDocumentIcon;
    }
    if (!iconSrc && app.iconKey === 'notepadIcon') {
      iconSrc = themeAssets.notepadIcon ?? textDocumentIcon;
    }

    const label = getOsAppTitle(appId, app.title, themeKey, language);
    const icon = renderShortcutIcon(iconSrc, themeAssets.folderIcon);

    return {
      id: `shortcut-${appId}`,
      label,
      type: 'system',
      icon,
    };
  }).filter(Boolean) as DesktopIcon[];

  const initialDesktopIcons: DesktopIcon[] = [
    {
      id: 'my-computer',
      icon: getIconElement('computer'),
      label: getOsSystemLabel('myComputer', t.myComputer, themeKey, language),
      type: 'system'
    },
    {
      id: 'recycle-bin',
      icon: getIconElement('recycle'),
      label: getOsSystemLabel('recycleBin', t.recycleBin, themeKey, language),
      type: 'system'
    },
    {
      id: 'games-folder',
      icon: (
        <img
          src={resolveAssetPath(
            themeAssets.gamesFolderIcon,
            fallbackAssets.gamesFolderIcon ?? themeAssets.gamesIcon
          )}
          alt={gamesLabel}
          className="w-12 h-12 drop-shadow"
          onError={(e) => {
            e.currentTarget.src = resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon);
          }}
        />
      ),
      label: gamesLabel,
      type: 'system'
    },
    ...applicationShortcuts,
    ...desktopItems.map(item => ({
      id: item.id,
      icon: item.icon && typeof item.icon === 'string' ? (
        <img
          src={item.icon}
          alt=""
          className={`w-12 h-12 ${item.name === 'Bliss.jpg' ? 'object-cover border-2 border-white shadow-md' : ''}`}
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
          className="w-12 h-12"
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
  } = useDesktopIconGridState({
    initialDesktopIcons,
    viewport,
    desktopRef,
    iconRefs,
    onCloseStartMenu: closeStartMenu,
  });

  const handleOpenFile = useCallback(async (item: FileSystemItem, parentPath: string) => {
    const fullPath = joinWindowsPath(parentPath, item.name);
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
    if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
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
      title = `${item.name} - Notepad`;
    } else if (/\.(png|jpg|jpeg|gif)$/i.test(lowerName)) {
      if (typeof item.content === 'string') {
        content = <PictureViewer initialImage={item.content} />;
        title = `${item.name} - Picture Viewer`;
      }
    }

    if (!content) {
      playErrorSound();
      return;
    }

    const iconPath = getFileIcon(item);

    openWindow({
      id: `file:${fullPath}`,
      title,
      content,
      icon: typeof iconPath === 'string' ? iconPath : undefined,
      width,
      height,
    });
    playLaunchSound();
  }, [openWindow, playErrorSound, playLaunchSound]);

  const openExplorerWindow = useCallback((path: string) => {
    const normalizedPath = path || 'My Computer';
    const title =
      normalizedPath === 'My Computer'
        ? t.myComputer
        : normalizedPath.split('\\').filter(Boolean).pop() || normalizedPath;

    openWindow({
      id: `explorer:${normalizedPath}`,
      title,
      icon: normalizedPath === 'My Computer' ? themeAssets.computerIcon : themeAssets.folderIcon,
      width: 720,
      height: 520,
      content: (
        <MyComputer
          currentPath={normalizedPath}
          onOpenItem={handleOpenFile}
        />
      ),
    });
    playLaunchSound();
  }, [handleOpenFile, openWindow, playLaunchSound, t.myComputer, themeAssets.computerIcon, themeAssets.folderIcon]);

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
    openWindow({
      id: 'app:games-folder',
      title: gamesLabel,
      icon: resolveAssetPath(
        themeAssets.gamesFolderIcon,
        fallbackAssets.gamesFolderIcon ?? themeAssets.gamesIcon
      ),
      width: 820,
      height: 560,
      content: <GamesFolder onLaunch={openDoomVariant} />,
    });
    playLaunchSound();
  }, [
    fallbackAssets.gamesFolderIcon,
    gamesLabel,
    openDoomVariant,
    openWindow,
    playLaunchSound,
    themeAssets.gamesFolderIcon,
    themeAssets.gamesIcon,
  ]);

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
          break;
        case 'my-computer':
          openExplorerWindow('My Computer');
          break;
        case 'games-folder':
          openGamesFolder();
          break;
        case 'all-programs':
          openExplorerWindow('C:\\Program Files');
          break;
        case 'doom1':
        case 'doom2':
        case 'doom3':
          openDoomVariant(appId as DoomVariantId);
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

    const Component = config.app.component;
    let content: React.ReactNode = null;

    if (appId === 'minesweeper') {
      content = <Component onClose={() => closeWindow(MINESWEEPER_WINDOW_ID)} />;
    } else if (appId === 'pictures') {
      content = <Component onOpenImage={handleOpenPictureFromGallery} />;
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
      case 'recycle-bin':
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
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: [
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
        ],
      });
    },
    [selectedIcons, closeStartMenu, handleIconDoubleClick, setSelectedIcons]
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
      className={`${themeStyles.body.join(' ')} min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden os-shell os-${osClassName} os-desktop`}
      style={{
        backgroundImage: customWallpaper
          ? `url(${customWallpaper})`
          : isXpFamily && themeAssets.wallpaper
          ? `url(${themeAssets.wallpaper})`
          : undefined,
        backgroundColor: isXpFamily ? 'transparent' : '#008080',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingBottom: '30px'
      }}
      onMouseDown={handleDesktopMouseDown}
      onClick={(event) => {
        closeStartMenu();
        setContextMenu(null);
        if (desktopRef.current && event.target === desktopRef.current) {
          clearSelection();
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        closeStartMenu();
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: [
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
            { label: 'Properties' },
          ],
        });
      }}
    >
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

      <DesktopSelectionBox
        selectionBox={selectionBox}
        themeKey={themeKey}
      />

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
      >
        <div className="taskbar__inner">
          {/* Start Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
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
                <div className="w-4 h-4 bg-black">
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-yellow-500"></div>
                </div>
                <span className="text-black font-bold text-sm">{t.start ?? 'Start'}</span>
              </>
            )}
          </button>

          {/* Window List Area */}
          <div className="taskbar-windows flex-1 overflow-hidden">
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

          <div className="taskbar-lang">
            <LangSwitcher variant="tray" buttonClassName="taskbar-tray-icon taskbar-lang-button" />
          </div>

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
          />
        </div>
      </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
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
