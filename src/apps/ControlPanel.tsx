import { useMemo, useState } from 'react';
import { useApp } from '../contexts/useApp';
import type { ThemeAssetId } from '../themes/webos/themeAssets';
import { THEME_ASSETS } from '../themes/webos/themeAssets';
import { useGallery } from '../domain/gallery/useGallery';

type CPView = 'categories' | 'wallpaper';

export function ControlPanel() {
  const { theme } = useApp();
  const isXpFamily = theme !== 'win-98';
  const currentTheme = (theme as ThemeAssetId) ?? 'webos';
  const themeAssets = THEME_ASSETS[currentTheme] ?? THEME_ASSETS.webos;
  const controlPanelIcons = themeAssets.controlPanelIcons ?? {};

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
        id: 'sounds',
        title: 'Sounds, Speech, and Audio Devices',
        emoji: '🔊',
        items: ['Sounds and Audio Devices', 'Speech'],
      },
      {
        id: 'maintenance',
        title: 'Performance and Maintenance',
        emoji: '⚙️',
        items: ['System', 'Administrative Tools', 'Power Options', 'Scheduled Tasks'],
      },
      {
        id: 'hardware',
        title: 'Printers and Other Hardware',
        emoji: '🖨️',
        items: ['Printers and Faxes', 'Mouse', 'Keyboard', 'Scanners and Cameras'],
      },
      {
        id: 'users',
        title: 'User Accounts',
        emoji: '👤',
        items: ['Change an account', 'Create a new account', 'Change logon/logoff options'],
      },
      {
        id: 'regional',
        title: 'Date, Time, Language, and Regional Options',
        emoji: '🌍',
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
          <div className="pt-2 border-t border-white/20">
            <div className="p-2 hover:bg-white/20 rounded cursor-pointer">Windows Update</div>
            <div className="p-2 hover:bg-white/20 rounded cursor-pointer">Help and Support</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">

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
                          <div
                            key={i}
                            className={`${isXpFamily ? 'hover:underline' : ''} cursor-pointer`}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-300">
              <div className="flex items-center gap-2 text-sm">
                <span className={isXpFamily ? 'text-[#003399]' : 'text-[#000080]'}>
                  Switch to Classic View
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600 opacity-50 cursor-not-allowed">
                  Classic View shows all Control Panel icons
                </span>
              </div>
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
                Choose a background picture from{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">content/pictures/wallpapers/</code>
              </p>
            </div>

            {wallpapersLoading && (
              <p className="text-sm text-gray-500">Loading wallpapers…</p>
            )}

            {!wallpapersLoading && wallpapers.length === 0 && (
              <div className={`p-8 text-center rounded-lg border ${isXpFamily ? 'border-[#c7d8ed] bg-[#f0f5ff]' : 'border-gray-400 bg-white'}`}>
                <p className="text-sm text-gray-500">
                  No wallpapers found. Add images to{' '}
                  <code className="text-xs bg-gray-100 px-1 rounded">src/content/pictures/wallpapers/</code>
                </p>
              </div>
            )}

            {!wallpapersLoading && wallpapers.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {wallpapers.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => setSelectedWallpaper(wp.imagePath)}
                      className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        selectedWallpaper === wp.imagePath
                          ? 'border-[#316ac5] shadow-md'
                          : isXpFamily
                          ? 'border-[#c7d8ed] hover:border-[#739fcf]'
                          : 'border-gray-400 hover:border-gray-600'
                      }`}
                      title={wp.title}
                      aria-label={`Select wallpaper: ${wp.title}`}
                      aria-pressed={selectedWallpaper === wp.imagePath}
                    >
                      <img
                        src={wp.thumbnailPath}
                        alt={wp.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {selectedWallpaper === wp.imagePath && (
                        <div className="absolute inset-0 ring-2 ring-inset ring-[#316ac5] rounded-md pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Preview */}
                {(selectedWallpaper || customActive) && (
                  <div className={`rounded-lg border p-4 ${isXpFamily ? 'border-[#c7d8ed] bg-[#f0f5ff]' : 'border-gray-400 bg-white'}`}>
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
