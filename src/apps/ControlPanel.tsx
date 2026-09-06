import { useMemo, useState } from 'react';
import { useApp } from '../contexts/useApp';
import type { ThemeAssetId } from '../themes/webos/themeAssets';
import { THEME_ASSETS } from '../themes/webos/themeAssets';
import { useGallery } from '../domain/gallery/useGallery';
import { getOsVersionRules } from '../shells/os/osSkins';
import { getSystemSettingsSections } from '../system/settings/settingsSections';
import { useSystemActions } from '../system/actions/useSystemActions';
import { type SystemActionId } from '../system/actions/systemActionTypes';

type CPView = 'categories' | 'wallpaper' | 'systemInfo';
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

  const { wallpapers, loading: wallpapersLoading } = useGallery();

  // OS-specific visual theme map
  const isIos = theme.startsWith('ios');
  const isWin98 = theme === 'win-98';
  const isWinXp = theme === 'win-xp';
  const isWin7 = theme === 'win7';
  const isUbuntu = theme === 'ubuntu';
  const isArch = theme === 'arch';
  const isHalloween = theme === 'halloween';

  const isRu = language === 'ru';

  const categories = useMemo(
    () => [
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
    ],
    [isRu]
  );

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
    const iconPath = controlPanelIcons[categoryId];
    if (iconPath) {
      return (
        <img
          src={iconPath}
          alt=""
          className="w-10 h-10 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return <div className="text-3xl">{fallback}</div>;
  };

  // Container & section style resolvers
  const sidebarClass = isWin98
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

  const mainClass = isWin98
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

  const titleClass = isWin98
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

  const cardClass = isWin98
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
        <h2 className="text-sm font-bold mb-4">{isRu ? 'Панель управления' : 'Control Panel'}</h2>
        <div className="space-y-2 text-xs">
          <button
            className="w-full text-left p-2 rounded cursor-pointer transition-colors hover:bg-white/20 font-semibold"
            onClick={() => setDisplayMode(displayMode === 'category' ? 'classic' : 'category')}
          >
            {displayMode === 'category'
              ? (isRu ? '🔄 Классический вид' : '🔄 Switch to Classic View')
              : (isRu ? '🗂️ Вид по категориям' : '🗂️ Switch to Category View')}
          </button>
          <button
            className={`w-full text-left p-2 rounded cursor-pointer transition-colors ${view === 'categories' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            onClick={() => setView('categories')}
          >
            📋 {isRu ? 'Главная' : 'Control Panel Home'}
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

        {/* ── System & Device Info View ── */}
        {view === 'systemInfo' && (
          <div className="space-y-6">
            <div className="mb-4">
              <h1 className={`text-2xl font-bold mb-1 ${titleClass}`}>
                System & Device Information
              </h1>
              <p className="text-xs opacity-75">
                Global System Services & OS Affordance Settings
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
              <h1 className={`text-2xl font-bold mb-2 ${titleClass}`}>
                {isRu ? 'Выберите категорию' : 'Pick a category'}
              </h1>
              <p className="text-sm opacity-75">
                {isRu ? 'или выберите значок Панели управления' : 'or pick a Control Panel icon'}
              </p>
            </div>

            <div className="space-y-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`${cardClass} p-4 cursor-pointer transition-colors`}
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
                Control Panel
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
