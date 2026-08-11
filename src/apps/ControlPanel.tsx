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

export function ControlPanel() {
  const { theme, language } = useApp();
  const { executeAction } = useSystemActions();
  const isXpFamily = theme !== 'win-98';
  const currentTheme = (theme as ThemeAssetId) ?? 'webos';
  const themeAssets = THEME_ASSETS[currentTheme] ?? THEME_ASSETS.webos;
  const controlPanelIcons = themeAssets.controlPanelIcons ?? {};

  const versionRules = getOsVersionRules(theme);
  const settingsSections = getSystemSettingsSections(theme);

  const [view, setView] = useState<CPView>('categories');
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(null);
  const [customActive, setCustomActive] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('desktop-custom-wallpaper');
    }
    return false;
  });

  const { wallpapers, loading: wallpapersLoading } = useGallery();

  const categories = useMemo(
    () => [
      {
        id: 'appearance',
        title: 'Appearance and Themes',
        emoji: '🎨',
        items: ['Display', 'Taskbar and Start Menu', 'Folder Options', 'Fonts'],
      },
      {
        id: 'network',
        title: 'Network and Internet Connections',
        emoji: '🌐',
        items: ['Internet Options', 'Network Connections', 'Windows Firewall'],
      },
      {
        id: 'programs',
        title: 'Add or Remove Programs',
        emoji: '💿',
        items: ['Change or Remove Programs', 'Add New Programs', 'Windows Components'],
      },
      {
        id: 'user-accounts',
        title: 'User Accounts',
        emoji: '👤',
        items: ['User Accounts', 'Network Passwords'],
      },
      {
        id: 'date-time',
        title: 'Date, Time, Language, and Regional Options',
        emoji: '🕒',
        items: ['Date and Time', 'Regional and Language Options'],
      },
      {
        id: 'accessibility',
        title: 'Accessibility Options',
        emoji: '♿',
        items: ['Accessibility Options', 'Narrator', 'Magnifier', 'On-Screen Keyboard'],
      },
    ],
    []
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

  return (
    <div className={`w-full h-full flex ${isXpFamily ? 'bg-white' : 'bg-[#c0c0c0]'} overflow-auto`}>
      {/* Sidebar */}
      <div className={`w-[200px] flex-shrink-0 ${isXpFamily ? 'bg-gradient-to-b from-[#1f62d2] to-[#3886ef]' : 'bg-[#000080]'} text-white p-4`}>
        <h2 className="text-sm font-bold mb-4">Control Panel</h2>
        <div className="space-y-2 text-xs">
          <button
            className={`w-full text-left p-2 rounded cursor-pointer transition-colors ${view === 'categories' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            onClick={() => setView('categories')}
          >
            Categories
          </button>
          <button
            className={`w-full text-left p-2 rounded cursor-pointer transition-colors ${view === 'wallpaper' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            onClick={() => setView('wallpaper')}
          >
            🖼️ Wallpaper
          </button>
          <button
            className={`w-full text-left p-2 rounded cursor-pointer transition-colors ${view === 'systemInfo' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            onClick={() => setView('systemInfo')}
          >
            💻 System & Device Info
          </button>
          <div className="pt-2 border-t border-white/20">
            <div
              className="p-2 hover:bg-white/20 rounded cursor-pointer"
              onClick={() => executeAction('language.toggle')}
            >
              🌐 Language ({language.toUpperCase()})
            </div>
            <div
              className="p-2 hover:bg-white/20 rounded cursor-pointer"
              onClick={() => executeAction('settings.reset')}
            >
              🔄 Reset System Settings
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
              <h1 className={`text-2xl font-bold mb-1 ${isXpFamily ? 'text-[#003399]' : 'text-black'}`}>
                System & Device Information
              </h1>
              <p className="text-xs text-gray-600">
                Global System Services & OS Affordance Settings
              </p>
            </div>

            {/* Active & Frozen Settings Sections */}
            {settingsSections.map((section) => (
              <div
                key={section.id}
                className={`p-4 rounded-lg ${
                  isXpFamily
                    ? 'bg-white border border-[#c7d8ed]'
                    : 'bg-white border-2 border-gray-400'
                }`}
              >
                <h3 className={`font-bold text-sm mb-3 ${isXpFamily ? 'text-[#003399]' : 'text-[#000080]'}`}>
                  {section.title[language] ?? section.title.en}
                </h3>
                <div className="space-y-2 text-xs">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        item.frozen
                          ? 'bg-gray-100 opacity-65 cursor-not-allowed'
                          : 'bg-gray-50 hover:bg-blue-50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-800">
                          {item.label[language] ?? item.label.en}
                          {item.frozen && (
                            <span className="ml-2 text-[10px] bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                              Frozen Placeholder
                            </span>
                          )}
                        </div>
                        {item.valueDescription && (
                          <div className="text-gray-500 text-[11px]">
                            {item.valueDescription[language] ?? item.valueDescription.en}
                          </div>
                        )}
                        {item.note && (
                          <div className="text-gray-400 text-[10px] italic">
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
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <span className="font-bold">Verification Note: </span>
                {versionRules.note}
              </div>
            )}
          </div>
        )}

        {/* ── Categories view ── */}
        {view === 'categories' && (
          <>
            <div className="mb-6">
              <h1 className={`text-2xl font-bold mb-2 ${isXpFamily ? 'text-[#003399]' : 'text-black'}`}>
                Pick a category
              </h1>
              <p className="text-sm text-gray-600">or pick a Control Panel icon</p>
            </div>

            <div className="space-y-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`${
                    isXpFamily
                      ? 'bg-gradient-to-b from-[#f0f5ff] to-[#e8f0ff] border border-[#c7d8ed] rounded-lg hover:border-[#739fcf]'
                      : 'bg-white border-2 border-gray-400'
                  } p-4 cursor-pointer transition-colors`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0">
                      {renderCategoryIcon(category.id, category.emoji)}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-base ${isXpFamily ? 'text-[#003399]' : 'text-[#000080]'} mb-1`}>
                        {category.title}
                      </h3>
                      <div className="text-xs text-gray-600 space-y-0.5">
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

        {/* ── Wallpaper view ── */}
        {view === 'wallpaper' && (
          <>
            <div className="mb-6">
              <h1 className={`text-2xl font-bold mb-2 ${isXpFamily ? 'text-[#003399]' : 'text-black'}`}>
                Desktop Wallpaper
              </h1>
              <p className="text-sm text-gray-600">
                Choose a background picture from the gallery or custom uploads
              </p>
            </div>

            {wallpapersLoading ? (
              <div className="text-center py-8 text-gray-500">Loading gallery wallpapers...</div>
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
                          : 'border-gray-300 hover:border-gray-400'
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
                  <div className={`p-4 rounded-lg ${isXpFamily ? 'bg-[#f0f5ff] border border-[#c7d8ed]' : 'bg-white border-2 border-gray-400'} mb-4`}>
                    <p className={`text-sm font-semibold mb-3 ${isXpFamily ? 'text-[#003399]' : 'text-[#000080]'}`}>
                      Preview
                    </p>
                    {selectedWallpaper && (
                      <div className="relative w-full max-w-xs mx-auto aspect-video rounded overflow-hidden border border-gray-300 shadow mb-3">
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
