import { useEffect, useState } from 'react';
import { BookOpen, FileText, Image as ImageIcon, Menu, Palette, User, X, Search } from 'lucide-react';
import { WeatherSwitcher } from './WeatherSwitcher';
import { Globe } from 'lucide-react';
import type { Language } from '../i18n/translations';

export type SectionNav = 'home' | 'blog' | 'about' | 'wiki' | 'gallery' | 'search';

interface NavigationProps {
  activeSection: SectionNav;
  onNavigate: (section: SectionNav) => void;
  theme: string;
  setTheme: (theme: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  themeOptions: { id: string; name: string; icon: string }[];
  navLabels: Record<SectionNav, string>;
}

export function Navigation({
  activeSection,
  onNavigate,
  theme,
  setTheme,
  language,
  setLanguage,
  themeOptions,
  navLabels,
}: NavigationProps) {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMobileOpen]);

  const languageOptions: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ];

  const navItems: { key: SectionNav; label: string; icon: JSX.Element }[] = [
    { key: 'home', label: navLabels.home, icon: <BookOpen className="w-4 h-4" /> },
    { key: 'blog', label: navLabels.blog, icon: <BookOpen className="w-4 h-4" /> },
    { key: 'about', label: navLabels.about, icon: <User className="w-4 h-4" /> },
    { key: 'wiki', label: navLabels.wiki, icon: <FileText className="w-4 h-4" /> },
    { key: 'gallery', label: navLabels.gallery, icon: <ImageIcon className="w-4 h-4" /> },
  ];

  const searchButton = (
    <button
      onClick={() => onNavigate('search')}
      className={`neu p-3 rounded-xl bg-card hover:scale-105 transition-transform duration-200 ${
        activeSection === 'search' ? 'ring-2 ring-primary' : ''
      }`}
      aria-label="Search"
    >
      <Search className="w-5 h-5 text-foreground" />
    </button>
  );

  const currentLang = languageOptions.find((l) => l.code === language) || languageOptions[0];

  const NavButtons = ({ mobile }: { mobile?: boolean }) => (
    <div className={`flex ${mobile ? 'flex-col gap-2' : 'items-center gap-2'}`}>
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => {
            onNavigate(item.key);
            if (mobile) setIsMobileOpen(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            activeSection === item.key
              ? 'neu-sm bg-card text-primary font-medium'
              : 'hover:bg-card/60 text-foreground/80'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="text-xl font-bold gradient-text hover:scale-105 transition-transform"
        >
          C4m1r.github.io
        </button>

        <nav className="hidden md:flex items-center gap-2">
          <NavButtons />
        </nav>

        <div className="flex items-center gap-3">
          {searchButton}
          <WeatherSwitcher />

          <div className="relative">
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="neu p-3 rounded-xl bg-card hover:scale-105 transition-transform duration-200"
              aria-label="Change theme"
            >
              <Palette className="w-5 h-5 text-foreground" />
            </button>
            {isThemeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsThemeOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 glass rounded-xl p-2 min-w-[200px]">
                  {themeOptions.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setIsThemeOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        theme === t.id ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span className="text-lg">{t.icon}</span>
                      <span className="font-medium">{t.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="neu p-3 rounded-xl bg-card hover:scale-105 transition-transform duration-200 flex items-center gap-2"
              aria-label="Change language"
            >
              <span className="text-lg">{currentLang.flag}</span>
              <Globe className="w-4 h-4 hidden sm:block" />
            </button>
            {isLangOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 glass rounded-xl p-2 min-w-[200px]">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                        language === lang.code ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden neu p-3 rounded-xl bg-card"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <nav className="md:hidden glass mt-4 mx-6 rounded-2xl p-4 animate-fade-in">
          <NavButtons mobile />
        </nav>
      )}
    </header>
  );
}
