import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../contexts/useApp';
import type { ThemeAssetId } from '../themes/webos/themeAssets';
import { THEME_ASSETS } from '../themes/webos/themeAssets';
import { useGallery } from '../domain/gallery/useGallery';
import { getOsVersionRules } from '../shells/os/osSkins';
import { getSystemSettingsSections } from '../system/settings/settingsSections';
import { useSystemActions } from '../system/actions/useSystemActions';
import { type SystemActionId } from '../system/actions/systemActionTypes';
import { APPLE_SETTINGS_CATEGORY_ICONS } from '../shells/desktop/appleSettingsAssets';

type CPView = 'categories' | 'wallpaper' | 'systemInfo' | 'accessibility' | 'network' | 'focus' | 'display';
type CPDisplayMode = 'category' | 'classic';

export function ControlPanel() {
  const { theme, language } = useApp();
  const { executeAction } = useSystemActions();
  const currentTheme = (theme as ThemeAssetId) ?? 'webos';
  const themeAssets = THEME_ASSETS[currentTheme] ?? THEME_ASSETS.webos;
  const controlPanelIcons = themeAssets.controlPanelIcons ?? {};

  const versionRules = getOsVersionRules(theme);
  const settingsSections = getSystemSettingsSections(theme);

  const [view, setView] = useState<CPView>('categories');
  const [displayMode, setDisplayMode] = useState<CPDisplayMode>('category');
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(null);
  const [customActive, setCustomActive] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('desktop-custom-wallpaper');
    }
    return false;
  });
  const [assistiveTouchEnabled, setAssistiveTouchEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('ios-assistive-touch-enabled') !== 'false';
  });
  const [wifiEnabled, setWifiEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('ios-wifi-enabled') !== 'false';
  });
  const [bluetoothEnabled, setBluetoothEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('ios-bluetooth-enabled') !== 'false';
  });
  const [macWifiEnabled, setMacWifiEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-wifi-enabled') !== 'false';
  });
  const [macBluetoothEnabled, setMacBluetoothEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('macos-bluetooth-enabled') !== 'false';
  });
  const [cellularEnabled, setCellularEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('ios-cellular-enabled') !== 'false';
  });
  const [airplaneEnabled, setAirplaneEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ios-airplane-enabled') === 'true';
  });
  const [focusEnabled, setFocusEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ios-focus-enabled') === 'true';
  });
  const [macFocusEnabled, setMacFocusEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('macos-focus-enabled') === 'true';
  });
  const [appleBrightness, setAppleBrightness] = useState(() => {
    if (typeof window === 'undefined') return 78;
    const key = theme === 'macos-26' ? 'macos-brightness-level' : 'ios-brightness-level';
    const saved = Number(localStorage.getItem(key));
    return Number.isFinite(saved) && saved >= 0 && saved <= 100 ? saved : 78;
  });
  const [appleNightMode, setAppleNightMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const key = theme === 'macos-26' ? 'macos-night-shift-enabled' : 'ios-night-mode-enabled';
    return localStorage.getItem(key) === 'true';
  });

  useEffect(() => {
    const handleMacConnectivityChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ wifi?: boolean; bluetooth?: boolean }>;
      if (typeof customEvent.detail?.wifi === 'boolean') setMacWifiEnabled(customEvent.detail.wifi);
      if (typeof customEvent.detail?.bluetooth === 'boolean') setMacBluetoothEnabled(customEvent.detail.bluetooth);
    };

    window.addEventListener('macos-connectivity-changed', handleMacConnectivityChange);
    return () => window.removeEventListener('macos-connectivity-changed', handleMacConnectivityChange);
  }, []);

  useEffect(() => {
    const handleConnectivityChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        wifi?: boolean;
        bluetooth?: boolean;
        cellular?: boolean;
        airplane?: boolean;
      }>;
      if (typeof customEvent.detail?.wifi === 'boolean') setWifiEnabled(customEvent.detail.wifi);
      if (typeof customEvent.detail?.bluetooth === 'boolean') setBluetoothEnabled(customEvent.detail.bluetooth);
      if (typeof customEvent.detail?.cellular === 'boolean') setCellularEnabled(customEvent.detail.cellular);
      if (typeof customEvent.detail?.airplane === 'boolean') setAirplaneEnabled(customEvent.detail.airplane);
    };

    window.addEventListener('ios-connectivity-changed', handleConnectivityChange);
    return () => window.removeEventListener('ios-connectivity-changed', handleConnectivityChange);
  }, []);

  useEffect(() => {
    const handleFocusChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') setFocusEnabled(customEvent.detail);
    };

    window.addEventListener('ios-focus-changed', handleFocusChange);
    return () => window.removeEventListener('ios-focus-changed', handleFocusChange);
  }, []);

  useEffect(() => {
    const handleMacFocusChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') setMacFocusEnabled(customEvent.detail);
    };

    window.addEventListener('macos-focus-changed', handleMacFocusChange);
    return () => window.removeEventListener('macos-focus-changed', handleMacFocusChange);
  }, []);

  useEffect(() => {
    const brightnessEvent = theme === 'macos-26' ? 'macos-brightness-changed' : 'ios-brightness-changed';
    const nightEvent = theme === 'macos-26' ? 'macos-night-shift-changed' : 'ios-night-mode-changed';

    const handleBrightnessChange = (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      if (typeof customEvent.detail === 'number') setAppleBrightness(customEvent.detail);
    };
    const handleNightModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') setAppleNightMode(customEvent.detail);
    };

    window.addEventListener(brightnessEvent, handleBrightnessChange);
    window.addEventListener(nightEvent, handleNightModeChange);
    return () => {
      window.removeEventListener(brightnessEvent, handleBrightnessChange);
      window.removeEventListener(nightEvent, handleNightModeChange);
    };
  }, [theme]);

  useEffect(() => {
    if (!isMac && !isIos) return;
    const brightnessKey = isMac ? 'macos-brightness-level' : 'ios-brightness-level';
    const nightKey = isMac ? 'macos-night-shift-enabled' : 'ios-night-mode-enabled';
    const savedBrightness = Number(localStorage.getItem(brightnessKey));
    setAppleBrightness(Number.isFinite(savedBrightness) ? savedBrightness : 78);
    setAppleNightMode(localStorage.getItem(nightKey) === 'true');
  }, [isIos, isMac]);

  const setConnectivity = (
    key: 'wifi' | 'bluetooth' | 'cellular' | 'airplane',
    value: boolean
  ) => {
    if (key === 'wifi') setWifiEnabled(value);
    else if (key === 'bluetooth') setBluetoothEnabled(value);
    else if (key === 'cellular') setCellularEnabled(value);
    else setAirplaneEnabled(value);

    localStorage.setItem(`ios-${key}-enabled`, String(value));
    window.dispatchEvent(new CustomEvent('ios-connectivity-changed', {
      detail: { [key]: value },
    }));
  };

  const setMacConnectivity = (key: 'wifi' | 'bluetooth', value: boolean) => {
    if (key === 'wifi') setMacWifiEnabled(value);
    else setMacBluetoothEnabled(value);

    localStorage.setItem(`macos-${key}-enabled`, String(value));
    window.dispatchEvent(new CustomEvent('macos-connectivity-changed', {
      detail: { [key]: value },
    }));
  };

  const setFocusMode = (value: boolean) => {
    setFocusEnabled(value);
    localStorage.setItem('ios-focus-enabled', String(value));
    window.dispatchEvent(new CustomEvent('ios-focus-changed', { detail: value }));
  };

  const setMacFocusMode = (value: boolean) => {
    setMacFocusEnabled(value);
    localStorage.setItem('macos-focus-enabled', String(value));
    window.dispatchEvent(new CustomEvent('macos-focus-changed', { detail: value }));
  };

  const setAppleBrightnessLevel = (value: number) => {
    const normalized = Math.max(isMac ? 20 : 0, Math.min(100, value));
    setAppleBrightness(normalized);
    const key = isMac ? 'macos-brightness-level' : 'ios-brightness-level';
    const eventName = isMac ? 'macos-brightness-changed' : 'ios-brightness-changed';
    localStorage.setItem(key, String(normalized));
    window.dispatchEvent(new CustomEvent(eventName, { detail: normalized }));
  };

  const setAppleNightModeEnabled = (value: boolean) => {
    setAppleNightMode(value);
    const key = isMac ? 'macos-night-shift-enabled' : 'ios-night-mode-enabled';
    const eventName = isMac ? 'macos-night-shift-changed' : 'ios-night-mode-changed';
    localStorage.setItem(key, String(value));
    window.dispatchEvent(new CustomEvent(eventName, { detail: value }));
  };

  const { wallpapers, loading: wallpapersLoading } = useGallery();

  // OS-specific visual theme map
  const isMac = theme === 'macos-26';
  const isIos = theme.startsWith('ios');
  const useModernAppleSettingsIcons = isMac || theme === 'ios-16' || theme === 'ios-26';
  const isWin98 = theme === 'win-98';
  const isWinXp = theme === 'win-xp';
  const isWin7 = theme === 'win7';
  const isUbuntu = theme === 'ubuntu';
  const isArch = theme === 'arch';
  const isHalloween = theme === 'halloween';

  const isRu = language === 'ru';

  const categories = useMemo(() => {
    if (isMac || isIos) {
      return [
        {
          id: 'appearance',
          title: isRu ? 'Оформление' : 'Appearance',
          emoji: '🎨',
          items: isRu
            ? ['Экран и яркость', 'Обои', 'Рабочий стол и Dock']
            : ['Display & Brightness', 'Wallpaper', 'Desktop & Dock'],
        },
        {
          id: 'network',
          title: isRu ? 'Сеть' : 'Network',
          emoji: '🌐',
          items: isIos
            ? (isRu
                ? ['Авиарежим', 'Wi-Fi', 'Bluetooth', 'Сотовая связь']
                : ['Airplane Mode', 'Wi-Fi', 'Bluetooth', 'Cellular'])
            : (isRu
                ? ['Wi-Fi', 'Bluetooth']
                : ['Wi-Fi', 'Bluetooth']),
        },
        {
          id: 'programs',
          title: isRu ? 'Приложения' : 'Apps',
          emoji: '💿',
          items: isRu
            ? ['Установленные приложения', 'Приложения по умолчанию', 'Расширения']
            : ['Installed Apps', 'Default Apps', 'Extensions'],
        },
        {
          id: 'sounds',
          title: isRu ? 'Звук' : 'Sound',
          emoji: '🔊',
          items: isRu
            ? ['Вывод', 'Ввод', 'Звуковые эффекты']
            : ['Output', 'Input', 'Sound Effects'],
        },
        ...((isIos || isMac) ? [{
          id: 'focus',
          title: isRu ? 'Фокусирование' : 'Focus',
          emoji: '🌙',
          items: isRu
            ? ['Не беспокоить', 'Режим фокусирования']
            : ['Do Not Disturb', 'Focus Mode'],
        }] : []),
        {
          id: 'maintenance',
          title: isRu ? 'Основные' : 'General',
          emoji: '🛡️',
          items: isRu
            ? ['Обновление ПО', 'Хранилище', 'Энергосбережение']
            : ['Software Update', 'Storage', 'Energy'],
        },
        {
          id: 'hardware',
          title: isRu ? 'Устройства' : 'Devices',
          emoji: '🖨️',
          items: isRu
            ? ['Bluetooth', 'Дисплеи', 'Принтеры и сканеры']
            : ['Bluetooth', 'Displays', 'Printers & Scanners'],
        },
        {
          id: 'user-accounts',
          title: isRu ? 'Пользователи и учётные записи' : 'Users & Accounts',
          emoji: '👤',
          items: isRu
            ? ['Пользователи и группы', 'Пароли', 'Учётная запись']
            : ['Users & Groups', 'Passwords', 'Account'],
        },
        {
          id: 'date-time',
          title: isRu ? 'Дата, время и язык' : 'Date, Time & Language',
          emoji: '🕒',
          items: isRu
            ? ['Дата и время', 'Язык и регион', 'Часовой пояс']
            : ['Date & Time', 'Language & Region', 'Time Zone'],
        },
        {
          id: 'accessibility',
          title: isRu ? 'Универсальный доступ' : 'Accessibility',
          emoji: '♿',
          items: isRu
            ? ['Зрение', 'Слух', 'Моторика']
            : ['Vision', 'Hearing', 'Motor'],
        },
      ];
    }

    return [
      {
        id: 'appearance',
        title: isRu ? 'Оформление и темы' : 'Appearance and Themes',
        emoji: '🎨',
        items: isRu
          ? ['Экран', 'Панель задач и меню «Пуск»', 'Свойства папки', 'Шрифты']
          : ['Display', 'Taskbar and Start Menu', 'Folder Options', 'Fonts'],
      },
      {
        id: 'network',
        title: isRu ? 'Сеть и подключения к Интернету' : 'Network and Internet Connections',
        emoji: '🌐',
        items: isRu
          ? ['Свойства обозревателя', 'Сетевые подключения', 'Брандмауэр Windows']
          : ['Internet Options', 'Network Connections', 'Windows Firewall'],
      },
      {
        id: 'programs',
        title: isRu ? 'Установка и удаление программ' : 'Add or Remove Programs',
        emoji: '💿',
        items: isRu
          ? ['Изменение или удаление программ', 'Установка новых программ', 'Компоненты Windows']
          : ['Change or Remove Programs', 'Add New Programs', 'Windows Components'],
      },
      {
        id: 'sounds',
        title: isRu ? 'Звук, речь и аудиоустройства' : 'Sounds, Speech, and Audio Devices',
        emoji: '🔊',
        items: isRu
          ? ['Громкость', 'Звуковые схемы', 'Речь']
          : ['Adjust the system volume', 'Change the sound scheme', 'Speech'],
      },
      {
        id: 'maintenance',
        title: isRu ? 'Производительность и обслуживание' : 'Performance and Maintenance',
        emoji: '🛡️',
        items: isRu
          ? ['Администрирование', 'Электропитание', 'Система']
          : ['Administrative Tools', 'Power Options', 'System'],
      },
      {
        id: 'hardware',
        title: isRu ? 'Принтеры и другое оборудование' : 'Printers and Other Hardware',
        emoji: '🖨️',
        items: isRu
          ? ['Принтеры и факсы', 'Игровые устройства', 'Клавиатура', 'Мышь']
          : ['Printers and Faxes', 'Game Controllers', 'Keyboard', 'Mouse'],
      },
      {
        id: 'user-accounts',
        title: isRu ? 'Учетные записи пользователей' : 'User Accounts',
        emoji: '👤',
        items: isRu
          ? ['Учетные записи пользователей', 'Сетевые пароли']
          : ['User Accounts', 'Network Passwords'],
      },
      {
        id: 'date-time',
        title: isRu ? 'Дата, время, язык и региональные стандарты' : 'Date, Time, Language, and Regional Options',
        emoji: '🕒',
        items: isRu
          ? ['Дата и время', 'Язык и региональные стандарты']
          : ['Date and Time', 'Regional and Language Options'],
      },
      {
        id: 'accessibility',
        title: isRu ? 'Специальные возможности' : 'Accessibility Options',
        emoji: '♿',
        items: isRu
          ? ['Специальные возможности', 'Диктор', 'Экранная лупа', 'Экранная клавиатура']
          : ['Accessibility Options', 'Narrator', 'Magnifier', 'On-Screen Keyboard'],
      },
    ];
  }, [isIos, isMac, isRu]);

  const classicApplets = useMemo(
    () => [
      { id: 'accessibility', title: isRu ? 'Специальные возможности' : 'Accessibility Options', emoji: '♿' },
      { id: 'programs', title: isRu ? 'Установка и удаление программ' : 'Add or Remove Programs', emoji: '💿' },
      { id: 'maintenance', title: isRu ? 'Администрирование' : 'Administrative Tools', emoji: '🛡️' },
      { id: 'date-time', title: isRu ? 'Дата и время' : 'Date and Time', emoji: '🕒' },
      { id: 'appearance', title: isRu ? 'Экран' : 'Display', emoji: '🎨' },
      { id: 'appearance', title: isRu ? 'Свойства папки' : 'Folder Options', emoji: '📁' },
      { id: 'appearance', title: isRu ? 'Шрифты' : 'Fonts', emoji: '🔤' },
      { id: 'hardware', title: isRu ? 'Игровые устройства' : 'Game Controllers', emoji: '🎮' },
      { id: 'network', title: isRu ? 'Свойства обозревателя' : 'Internet Options', emoji: '🌐' },
      { id: 'hardware', title: isRu ? 'Клавиатура' : 'Keyboard', emoji: '⌨️' },
      { id: 'hardware', title: isRu ? 'Мышь' : 'Mouse', emoji: '🖱️' },
      { id: 'network', title: isRu ? 'Сетевые подключения' : 'Network Connections', emoji: '📡' },
      { id: 'hardware', title: isRu ? 'Принтеры и факсы' : 'Printers and Faxes', emoji: '🖨️' },
      { id: 'sounds', title: isRu ? 'Звуковые устройства' : 'Sounds and Audio Devices', emoji: '🔊' },
      { id: 'maintenance', title: isRu ? 'Система' : 'System', emoji: '💻' },
      { id: 'user-accounts', title: isRu ? 'Учетные записи пользователей' : 'User Accounts', emoji: '👤' },
    ],
    [isRu]
  );

  const renderCategoryIcon = (categoryId: string, fallback: string) => {
    const appleIconPath = useModernAppleSettingsIcons
      ? APPLE_SETTINGS_CATEGORY_ICONS[categoryId]
      : undefined;
    if (appleIconPath) {
      return (
        <span className={`settings-category-symbol settings-category-symbol--${categoryId}`}>
          <img
            src={appleIconPath}
            alt=""
            className="settings-category-symbol__glyph"
          />
        </span>
      );
    }

    const iconPath = controlPanelIcons[categoryId];
    if (iconPath) {
      return (
        <img
          src={iconPath}
          alt=""
          className="settings-category-icon w-10 h-10 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return <div className="text-3xl">{fallback}</div>;
  };

  // Container & section style resolvers
  const sidebarClass = isMac
    ? 'bg-white/65 text-[#1d1d1f] border-r border-black/10 backdrop-blur-xl'
    : isWin98
    ? 'bg-[#000080] text-white'
    : isWinXp
    ? 'bg-gradient-to-b from-[#1f62d2] to-[#3886ef] text-white'
    : isWin7
    ? 'bg-gradient-to-b from-[#1e3c72] to-[#2a5298] text-white'
    : isUbuntu
    ? 'bg-[#2c2c2c] text-white'
    : isArch
    ? 'bg-[#0f1419] text-[#1793d1] border-r border-[#1793d1]/30 font-mono'
    : isHalloween
    ? 'bg-[#120524] text-[#ff7518] border-r border-[#ff7518]/30'
    : isIos
    ? 'bg-[#1c1c1e] text-white'
    : 'bg-gradient-to-b from-[#003b46] to-[#07575b] text-white';

  const mainClass = isMac
    ? 'bg-[#f5f5f7] text-[#1d1d1f]'
    : isWin98
    ? 'bg-[#c0c0c0] text-black'
    : isWinXp
    ? 'bg-white text-black'
    : isWin7
    ? 'bg-[#f4f7fb] text-black'
    : isUbuntu
    ? 'bg-[#383838] text-white'
    : isArch
    ? 'bg-[#171d23] text-[#e6eff8] font-mono'
    : isHalloween
    ? 'bg-[#1a0933] text-[#f0e6ff]'
    : isIos
    ? 'bg-black text-white'
    : 'bg-[#07575b] text-white';

  const titleClass = isMac
    ? 'text-[#1d1d1f]'
    : isWin98
    ? 'text-[#000080]'
    : isWinXp
    ? 'text-[#003399]'
    : isWin7
    ? 'text-[#1e3e6b]'
    : isUbuntu
    ? 'text-[#e95420]'
    : isArch
    ? 'text-[#1793d1]'
    : isHalloween
    ? 'text-[#ff7518]'
    : isIos
    ? 'text-white'
    : 'text-[#66a5ad]';

  const cardClass = isMac
    ? 'bg-white/80 border border-black/10 shadow-sm rounded-xl hover:bg-white'
    : isWin98
    ? 'bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]'
    : isWinXp
    ? 'bg-gradient-to-b from-[#f0f5ff] to-[#e8f0ff] border border-[#c7d8ed] rounded-lg hover:border-[#739fcf]'
    : isWin7
    ? 'bg-white/90 border border-[#b8c9dc] shadow-sm rounded-md hover:border-[#7098c4]'
    : isUbuntu
    ? 'bg-[#454545] border border-[#525252] rounded-md text-white'
    : isArch
    ? 'bg-[#1f262e] border border-[#1793d1]/40 rounded-sm text-[#e6eff8]'
    : isHalloween
    ? 'bg-[#281048] border border-[#ff7518]/50 shadow-[0_0_12px_rgba(255,117,24,0.2)] rounded-lg text-[#f0e6ff]'
    : isIos
    ? 'bg-[#1c1c1e] border border-white/10 rounded-xl text-white'
    : 'bg-[#66a5ad]/20 border border-[#66a5ad]/40 rounded-xl text-white';

  return (
    <div
      className={`w-full h-full flex ${mainClass} overflow-auto`}
      data-os-theme={theme}
      data-settings-surface="control-panel"
    >
      {/* Sidebar */}
      <div className={`w-[200px] flex-shrink-0 ${sidebarClass} p-4`}>
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-65">
            NervaWEB WebOS
          </div>
          <h2 className="text-sm font-bold mt-1">
            {isMac ? (isRu ? 'Системные настройки' : 'System Settings') : isIos ? (isRu ? 'Настройки' : 'Settings') : isRu ? 'Панель управления' : 'Control Panel'}
          </h2>
        </div>
        <div className="space-y-2 text-xs">
          {!isMac && !isIos && (
            <button
              className="w-full text-left p-2 rounded cursor-pointer transition-colors hover:bg-white/20 font-semibold"
              onClick={() => setDisplayMode(displayMode === 'category' ? 'classic' : 'category')}
            >
              {displayMode === 'category'
                ? (isRu ? '🔄 Классический вид' : '🔄 Switch to Classic View')
                : (isRu ? '🗂️ Вид по категориям' : '🗂️ Switch to Category View')}
            </button>
          )}
          <button
            className={`w-full text-left p-2 rounded cursor-pointer transition-colors ${view === 'categories' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            onClick={() => setView('categories')}
          >
            {isMac ? '⚙ ' : '📋 '}{isRu ? 'Главная' : isMac ? 'General' : 'Control Panel Home'}
          </button>
          <button
            className={`w-full text-left p-2 rounded cursor-pointer transition-colors ${view === 'wallpaper' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            onClick={() => setView('wallpaper')}
          >
            🖼️ {isRu ? 'Фоновый рисунок' : 'Wallpaper'}
          </button>
          <button
            className={`w-full text-left p-2 rounded cursor-pointer transition-colors ${view === 'systemInfo' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            onClick={() => setView('systemInfo')}
          >
            💻 {isRu ? 'Система' : 'System & Device Info'}
          </button>
          <div className="pt-2 border-t border-white/20">
            <div
              className="p-2 hover:bg-white/20 rounded cursor-pointer"
              onClick={() => executeAction('language.toggle')}
            >
              🌐 {isRu ? 'Язык' : 'Language'} ({language.toUpperCase()})
            </div>
            <div
              className="p-2 hover:bg-white/20 rounded cursor-pointer"
              onClick={() => executeAction('settings.reset')}
            >
              🔄 {isRu ? 'Сброс настроек' : 'Reset System Settings'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">

        {/* ── Apple Display & Brightness view ── */}
        {view === 'display' && (isMac || isIos) && (
          <div className="space-y-5">
            <div>
              <button
                type="button"
                className="text-xs opacity-70 hover:opacity-100 mb-3"
                onClick={() => setView('categories')}
              >
                ← {isRu ? 'Настройки' : 'Settings'}
              </button>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-60 mb-1">
                NervaWEB WebOS
              </div>
              <h1 className={`text-2xl font-bold mb-1 ${titleClass}`}>
                {isRu ? 'Экран и яркость' : 'Display & Brightness'}
              </h1>
            </div>

            <section className={`${cardClass} overflow-hidden`}>
              <div className="p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <strong>{isRu ? 'Яркость' : 'Brightness'}</strong>
                  <span className="opacity-60">{Math.round(appleBrightness)}%</span>
                </div>
                <input
                  type="range"
                  min={isMac ? 20 : 0}
                  max="100"
                  value={appleBrightness}
                  onChange={(event) => setAppleBrightnessLevel(Number(event.target.value))}
                  className="w-full"
                  aria-label={isRu ? 'Яркость экрана' : 'Display brightness'}
                />
              </div>

              <div className="flex items-center justify-between gap-4 p-4 min-h-[64px] border-t border-white/10">
                <div>
                  <strong className="block text-sm">
                    {isMac ? 'Night Shift' : (isRu ? 'Ночной режим' : 'Night Mode')}
                  </strong>
                  <span className="block mt-1 text-[11px] opacity-60">
                    {isRu ? 'Снижает холодный оттенок экрана' : 'Applies a warmer display tint'}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={appleNightMode}
                  className={`ios-settings-switch ${appleNightMode ? 'is-on' : ''}`}
                  onClick={() => setAppleNightModeEnabled(!appleNightMode)}
                >
                  <span />
                </button>
              </div>

              <div className="p-4 border-t border-white/10">
                <button
                  type="button"
                  className="text-xs font-semibold text-[#0a84ff] hover:opacity-80"
                  onClick={() => setView('wallpaper')}
                >
                  {isRu ? 'Обои…' : 'Wallpaper…'}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── System & Device Info View ── */}
        {view === 'systemInfo' && (
          <div className="space-y-6">
            <div className="mb-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-60 mb-1">
                NervaWEB WebOS
              </div>
              <h1 className={`text-2xl font-bold mb-1 ${titleClass}`}>
                System & Device Information
              </h1>
              <p className="text-xs opacity-75">
                NervaWEB WebOS system services, device metadata and OS affordance settings
              </p>
            </div>

            {/* Active & Frozen Settings Sections */}
            {settingsSections.map((section) => (
              <div key={section.id} className={`p-4 ${cardClass}`}>
                <h3 className={`font-bold text-sm mb-3 ${titleClass}`}>
                  {section.title[language] ?? section.title.en}
                </h3>
                <div className="space-y-2 text-xs">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        isIos ? 'min-h-[44px] py-3' : ''
                      } ${
                        item.frozen
                          ? 'bg-black/10 dark:bg-white/5 opacity-60 cursor-not-allowed'
                          : 'bg-black/5 dark:bg-white/10 hover:bg-blue-500/10'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">
                          {item.label[language] ?? item.label.en}
                          {item.frozen && (
                            <span className="ml-2 text-[10px] bg-gray-500/30 px-1.5 py-0.5 rounded font-mono">
                              {language === 'ru' ? 'Визуальный макет' : 'Visual Placeholder'}
                            </span>
                          )}
                        </div>
                        {item.valueDescription && (
                          <div className="opacity-75 text-[11px]">
                            {item.valueDescription[language] ?? item.valueDescription.en}
                          </div>
                        )}
                        {item.note && (
                          <div className="opacity-60 text-[10px] italic">
                            {item.note[language] ?? item.note.en}
                          </div>
                        )}
                      </div>

                      {item.actionId && !item.frozen && (
                        <button
                          onClick={() => executeAction(item.actionId as SystemActionId)}
                          className="px-2.5 py-1 rounded bg-[#316ac5] text-white hover:bg-[#255199] transition-colors text-xs font-medium cursor-pointer"
                        >
                          Execute
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Quick Metadata summary note */}
            {versionRules?.note && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs">
                <span className="font-bold">Verification Note: </span>
                {versionRules.note}
              </div>
            )}
          </div>
        )}

        {/* ── Categories view / Classic view ── */}
        {view === 'categories' && displayMode === 'category' && (
          <>
            <div className="mb-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-60 mb-1">
                NervaWEB WebOS
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${titleClass}`}>
                {isMac ? (isRu ? 'Системные настройки' : 'System Settings') : isRu ? 'Выберите категорию' : 'Pick a category'}
              </h1>
              <p className="text-sm opacity-75">
                {isMac
                  ? (isRu ? 'Настройте основные параметры системы' : 'Choose a settings category')
                  : isRu ? 'или выберите значок Панели управления' : 'or pick a Control Panel icon'}
              </p>
            </div>

            <div className="space-y-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`${cardClass} p-4 cursor-pointer transition-colors`}
                  onClick={() => {
                    if (category.id === 'appearance' && (isMac || isIos)) setView('display');
                    else if (category.id === 'appearance') setView('wallpaper');
                    else if (category.id === 'maintenance') setView('systemInfo');
                    else if (category.id === 'accessibility' && isIos) setView('accessibility');
                    else if (category.id === 'network' && (isIos || isMac)) setView('network');
                    else if (category.id === 'focus' && (isIos || isMac)) setView('focus');
                  }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0">
                      {renderCategoryIcon(category.id, category.emoji)}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-base ${titleClass} mb-1`}>
                        {category.title}
                      </h3>
                      <div className="text-xs opacity-80 space-y-0.5">
                        {category.items.map((item, i) => (
                          <div key={i} className="hover:underline cursor-pointer">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Classic View Applets Grid ── */}
        {view === 'categories' && displayMode === 'classic' && (
          <>
            <div className="mb-6">
              <h1 className={`text-2xl font-bold mb-2 ${titleClass}`}>
                {isMac ? 'System Settings' : isIos ? 'Settings' : 'Control Panel'}
              </h1>
              <p className="text-sm opacity-75">Classic View</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {classicApplets.map((applet, index) => (
                <div
                  key={index}
                  className={`${cardClass} p-3 flex flex-col items-center text-center cursor-pointer hover:scale-[1.02] transition-transform`}
                  onClick={() => {
                    if (applet.id === 'appearance') setView('wallpaper');
                    else if (applet.id === 'maintenance') setView('systemInfo');
                  }}
                >
                  <div className="mb-2">
                    {renderCategoryIcon(applet.id, applet.emoji)}
                  </div>
                  <span className="text-xs font-semibold leading-tight">{applet.title}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Apple Network view ── */}
        {view === 'network' && (isIos || isMac) && (
          <div className="space-y-5">
            <div>
              <button
                type="button"
                className="text-xs opacity-70 hover:opacity-100 mb-3"
                onClick={() => setView('categories')}
              >
                ← {isRu ? 'Настройки' : 'Settings'}
              </button>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-60 mb-1">
                NervaWEB WebOS
              </div>
              <h1 className={`text-2xl font-bold mb-1 ${titleClass}`}>
                {isRu ? 'Сеть' : 'Network'}
              </h1>
              <p className="text-xs opacity-70">
                {isRu ? 'Беспроводные подключения устройства' : 'Wireless device connectivity'}
              </p>
            </div>

            <section className={`${cardClass} overflow-hidden`}>
              {(isIos
                ? [
                    {
                      key: 'airplane' as const,
                      label: isRu ? 'Авиарежим' : 'Airplane Mode',
                      enabled: airplaneEnabled,
                      description: isRu ? 'Отключает Wi-Fi и сотовую связь' : 'Turns off Wi-Fi and cellular',
                    },
                    {
                      key: 'wifi' as const,
                      label: 'Wi-Fi',
                      enabled: wifiEnabled,
                      description: isRu ? 'Беспроводная сеть' : 'Wireless networking',
                    },
                    {
                      key: 'bluetooth' as const,
                      label: 'Bluetooth',
                      enabled: bluetoothEnabled,
                      description: isRu ? 'Беспроводные аксессуары' : 'Wireless accessories',
                    },
                    {
                      key: 'cellular' as const,
                      label: isRu ? 'Сотовая связь' : 'Cellular',
                      enabled: cellularEnabled,
                      description: isRu ? 'Мобильная передача данных' : 'Mobile data connectivity',
                    },
                  ]
                : [
                    {
                      key: 'wifi' as const,
                      label: 'Wi-Fi',
                      enabled: macWifiEnabled,
                      description: isRu ? 'Беспроводная сеть' : 'Wireless networking',
                    },
                    {
                      key: 'bluetooth' as const,
                      label: 'Bluetooth',
                      enabled: macBluetoothEnabled,
                      description: isRu ? 'Беспроводные аксессуары' : 'Wireless accessories',
                    },
                  ]
              ).map((item, index) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between gap-4 p-4 min-h-[64px] ${index > 0 ? 'border-t border-white/10' : ''}`}
                >
                  <div>
                    <strong className="block text-sm">{item.label}</strong>
                    <span className="block mt-1 text-[11px] opacity-60">{item.description}</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.enabled}
                    className={`ios-settings-switch ${item.enabled ? 'is-on' : ''}`}
                    onClick={() => {
                      const next = !item.enabled;
                      if (isIos) {
                        setConnectivity(item.key, next);
                        if (item.key === 'airplane' && next) {
                          setConnectivity('wifi', false);
                          setConnectivity('cellular', false);
                        }
                      } else {
                        setMacConnectivity(item.key as 'wifi' | 'bluetooth', next);
                      }
                    }}
                  >
                    <span />
                  </button>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* ── Apple Focus view ── */}
        {view === 'focus' && (isIos || isMac) && (
          <div className="space-y-5">
            <div>
              <button
                type="button"
                className="text-xs opacity-70 hover:opacity-100 mb-3"
                onClick={() => setView('categories')}
              >
                ← {isRu ? 'Настройки' : 'Settings'}
              </button>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-60 mb-1">
                NervaWEB WebOS
              </div>
              <h1 className={`text-2xl font-bold mb-1 ${titleClass}`}>
                {isRu ? 'Фокусирование' : 'Focus'}
              </h1>
              <p className="text-xs opacity-70">
                {isRu ? 'Управление режимом «Не беспокоить»' : 'Manage Do Not Disturb mode'}
              </p>
            </div>

            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex items-center justify-between gap-4 p-4 min-h-[64px]">
                <div>
                  <strong className="block text-sm">
                    {isRu ? 'Не беспокоить' : 'Do Not Disturb'}
                  </strong>
                  <span className="block mt-1 text-[11px] opacity-60">
                    {isRu ? 'Скрывает отвлекающие уведомления' : 'Reduce distracting notifications'}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isMac ? macFocusEnabled : focusEnabled}
                  className={`ios-settings-switch ${(isMac ? macFocusEnabled : focusEnabled) ? 'is-on' : ''}`}
                  onClick={() => {
                    if (isMac) setMacFocusMode(!macFocusEnabled);
                    else setFocusMode(!focusEnabled);
                  }}
                >
                  <span />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── Apple Accessibility view ── */}
        {view === 'accessibility' && isIos && (
          <div className="space-y-5">
            <div>
              <button
                type="button"
                className="text-xs opacity-70 hover:opacity-100 mb-3"
                onClick={() => setView('categories')}
              >
                ← {isRu ? 'Настройки' : 'Settings'}
              </button>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-60 mb-1">
                NervaWEB WebOS
              </div>
              <h1 className={`text-2xl font-bold mb-1 ${titleClass}`}>
                {isRu ? 'Универсальный доступ' : 'Accessibility'}
              </h1>
              <p className="text-xs opacity-70">
                {isRu ? 'Настройки управления и взаимодействия' : 'Interaction and accessibility controls'}
              </p>
            </div>

            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex items-center justify-between gap-4 p-4 min-h-[64px]">
                <div>
                  <strong className="block text-sm">AssistiveTouch</strong>
                  <span className="block mt-1 text-[11px] opacity-60">
                    {isRu
                      ? 'Плавающая кнопка с быстрым доступом к системным действиям'
                      : 'Floating control for quick access to system actions'}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={assistiveTouchEnabled}
                  className={`ios-settings-switch ${assistiveTouchEnabled ? 'is-on' : ''}`}
                  onClick={() => {
                    const next = !assistiveTouchEnabled;
                    setAssistiveTouchEnabled(next);
                    localStorage.setItem('ios-assistive-touch-enabled', String(next));
                    window.dispatchEvent(new CustomEvent('ios-assistive-touch-changed', { detail: next }));
                  }}
                >
                  <span />
                </button>
              </div>
              <div className="border-t border-white/10 p-4">
                <button
                  type="button"
                  className="w-full text-left text-xs font-semibold text-[#0a84ff] hover:opacity-80"
                  onClick={() => {
                    localStorage.removeItem('ios-hidden-home-icons');
                    window.dispatchEvent(new CustomEvent('ios-home-layout-reset'));
                  }}
                >
                  {isRu ? 'Сбросить расположение экрана «Домой»' : 'Reset Home Screen Layout'}
                </button>
                <span className="block mt-1 text-[10px] opacity-55">
                  {isRu
                    ? 'Возвращает скрытые приложения на экран «Домой»'
                    : 'Restores apps hidden from the Home Screen'}
                </span>
              </div>
            </section>
          </div>
        )}

        {/* ── Wallpaper view ── */}
        {view === 'wallpaper' && (
          <>
            <div className="mb-6">
              <h1 className={`text-2xl font-bold mb-2 ${titleClass}`}>
                Desktop Wallpaper
              </h1>
              <p className="text-sm opacity-75">
                Choose a background picture from the gallery or custom uploads
              </p>
            </div>

            {wallpapersLoading ? (
              <div className="text-center py-8 opacity-60">Loading gallery wallpapers...</div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {wallpapers.map((wp) => (
                    <div
                      key={wp.id}
                      onClick={() => setSelectedWallpaper(wp.imagePath)}
                      className={`relative aspect-video rounded overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedWallpaper === wp.imagePath
                          ? 'border-[#316ac5] ring-2 ring-[#316ac5]/50 scale-[1.02]'
                          : 'border-gray-500/30 hover:border-gray-500/60'
                      }`}
                    >
                      <img src={wp.imagePath} alt={wp.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 truncate text-center">
                        {wp.title}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Wallpaper Actions */}
                {(selectedWallpaper || customActive) && (
                  <div className={`p-4 ${cardClass} mb-4`}>
                    <p className={`text-sm font-semibold mb-3 ${titleClass}`}>
                      Preview
                    </p>
                    {selectedWallpaper && (
                      <div className="relative w-full max-w-xs mx-auto aspect-video rounded overflow-hidden border border-gray-500/30 shadow mb-3">
                        <img
                          src={selectedWallpaper}
                          alt="Wallpaper preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-2 max-w-xs mx-auto">
                      {selectedWallpaper && (
                        <button
                          onClick={() => {
                            localStorage.setItem('desktop-custom-wallpaper', selectedWallpaper);
                            window.dispatchEvent(new CustomEvent('wallpaper-changed', { detail: selectedWallpaper }));
                            setCustomActive(true);
                          }}
                          className="flex-1 py-1.5 px-3 rounded bg-[#316ac5] text-white hover:bg-[#255199] transition-colors text-xs font-semibold cursor-pointer"
                        >
                          Apply
                        </button>
                      )}
                      {customActive && (
                        <button
                          onClick={() => {
                            localStorage.removeItem('desktop-custom-wallpaper');
                            window.dispatchEvent(new CustomEvent('wallpaper-changed', { detail: null }));
                            setCustomActive(false);
                            setSelectedWallpaper(null);
                          }}
                          className="flex-1 py-1.5 px-3 rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors text-xs font-semibold cursor-pointer"
                        >
                          Restore Default
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
