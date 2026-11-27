import { MarkdownViewer, MarkdownCategory } from './MarkdownViewer';
import { useState } from 'react';
import { useApp } from '../contexts/useApp';
import { getActiveEdition, editionDescription } from '../shells/os/osEditions';

const aboutCategories: MarkdownCategory[] = [
  {
    id: 'info',
    name: 'Информация',
    files: [
      {
        id: 'about-me',
        title: 'Обо мне',
        content: `# Обо мне

Привет! Меня зовут C4m1r.

## Навыки

- Программирование
- Дизайн
- Разработка веб-приложений

## Контакты

Свяжитесь со мной через...`,
        date: '2024-01-01'
      }
    ]
  },
  {
    id: 'experience',
    name: 'Опыт работы',
    files: [
      {
        id: 'exp1',
        title: 'Опыт работы',
        content: `# Опыт работы

Описание опыта работы.`,
        date: '2024-01-05'
      }
    ]
  }
];

function MacDeviceGlyph() {
  return (
    <svg className="about-mac__device" viewBox="0 0 160 104" fill="none" aria-hidden="true">
      <rect x="24" y="8" width="112" height="72" rx="7" fill="currentColor" opacity="0.22" />
      <rect x="28" y="12" width="104" height="64" rx="4" fill="#151518" />
      <circle cx="80" cy="43" r="12" fill="rgba(255,255,255,0.08)" />
      <path d="M16 83h128l8 10H8l8-10Z" fill="currentColor" opacity="0.30" />
      <rect x="7" y="93" width="146" height="4" rx="2" fill="currentColor" opacity="0.22" />
    </svg>
  );
}

export function AboutApp() {
  const { theme, language } = useApp();
  const [showDetails, setShowDetails] = useState(false);
  const [tab, setTab] = useState<'system' | 'bio'>('system');
  const isRu = language === 'ru';
  const activeEdition = getActiveEdition(theme);

  if (theme === 'macos-26') {
    const runtime = typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser runtime';

    return (
      <div className="about-mac">
        <div className="about-mac__hero">
          <MacDeviceGlyph />
          <h1>7Bit Mac</h1>
          <p>macOS Tahoe 26 compatibility theme</p>
        </div>

        <div className="about-mac__specs">
          <div><span>System</span><strong>7Bit WebOS</strong></div>
          <div><span>Theme</span><strong>macOS 26</strong></div>
          <div><span>Runtime</span><strong>Browser</strong></div>
          <div><span>Interface</span><strong>Apple test stand</strong></div>
        </div>

        <div className="about-mac__runtime">
          <small>Runtime information</small>
          <p>{runtime}</p>
        </div>

        <button
          type="button"
          className="about-mac__more"
          onClick={() => setShowDetails((value) => !value)}
          aria-expanded={showDetails}
        >
          {showDetails ? 'Less Info' : 'More Info…'}
        </button>

        {showDetails && (
          <div className="about-mac__details">
            <div><span>Language</span><strong>{navigator.language || 'Unknown'}</strong></div>
            <div><span>Viewport</span><strong>{window.innerWidth} × {window.innerHeight}</strong></div>
            <div><span>Platform</span><strong>{navigator.platform || 'Web'}</strong></div>
          </div>
        )}

        <footer>
          Pseudo-emulation interface for development and compatibility testing.
        </footer>
      </div>
    );
  }

  if (['win-98', 'win2000', 'win-xp', 'win7'].includes(theme)) {
    const productName =
      theme === 'win-98'
        ? `Microsoft Windows 98 ${activeEdition?.id === 'second-edition' ? 'Second Edition' : 'First Edition'}`
        : theme === 'win2000'
        ? `Microsoft® Windows® 2000 ${activeEdition?.label ?? 'Professional'}`
        : theme === 'win-xp'
        ? `Microsoft® Windows® XP ${activeEdition?.label ?? 'Professional'}`
        : `Windows 7 ${activeEdition?.label ?? 'Ultimate'}`;

    const buildNumber = activeEdition?.buildNumber ?? 'Service Pack 1';

    return (
      <div className="h-full flex flex-col bg-[#ece9d8] dark:bg-gray-800 text-black dark:text-white select-none font-sans text-xs">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-400 bg-gray-200 dark:bg-gray-700 px-2 pt-2 gap-1">
          <button
            type="button"
            onClick={() => setTab('system')}
            className={`px-3 py-1 text-xs font-medium rounded-t border-t border-l border-r ${
              tab === 'system'
                ? 'bg-[#ece9d8] dark:bg-gray-800 border-gray-400 -mb-px font-semibold'
                : 'bg-gray-300 dark:bg-gray-600 border-transparent hover:bg-gray-200'
            }`}
          >
            {isRu ? 'О системе' : 'About Windows'}
          </button>
          <button
            type="button"
            onClick={() => setTab('bio')}
            className={`px-3 py-1 text-xs font-medium rounded-t border-t border-l border-r ${
              tab === 'bio'
                ? 'bg-[#ece9d8] dark:bg-gray-800 border-gray-400 -mb-px font-semibold'
                : 'bg-gray-300 dark:bg-gray-600 border-transparent hover:bg-gray-200'
            }`}
          >
            {isRu ? 'Обо мне (Портфолио)' : 'About Me'}
          </button>
        </div>

        {tab === 'system' ? (
          <div className="flex-1 p-5 overflow-auto flex flex-col justify-between">
            <div>
              {/* Windows Logo & Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-300 dark:border-gray-600 mb-4">
                <div className="w-12 h-12 grid grid-cols-2 gap-0.5 p-0.5 shrink-0">
                  <div className="bg-[#e03f19] rounded-tl-sm shadow-sm" />
                  <div className="bg-[#7fb900] rounded-tr-sm shadow-sm" />
                  <div className="bg-[#00a4ef] rounded-bl-sm shadow-sm" />
                  <div className="bg-[#ffba08] rounded-br-sm shadow-sm" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">{productName}</h1>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px] font-mono mt-0.5">{buildNumber}</p>
                </div>
              </div>

              {/* Legal & License Notice */}
              <div className="space-y-3 text-[11px] leading-relaxed text-gray-700 dark:text-gray-200">
                <p>
                  Copyright © 1981-2009 Microsoft Corporation. {isRu ? 'Все права защищены.' : 'All rights reserved.'}
                </p>
                <p className="italic text-gray-500 dark:text-gray-400">
                  {activeEdition ? editionDescription(activeEdition, language) : 'Операционная система семейства Microsoft Windows.'}
                </p>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="font-semibold">{isRu ? 'Лицензия предоставлена пользователю:' : 'This product is licensed to:'}</p>
                  <p className="pl-3 mt-1 font-mono text-gray-800 dark:text-gray-100">C4m1r</p>
                  <p className="pl-3 text-gray-500 font-mono text-[10px]">Full-Stack Engineer &amp; OS Systems Enthusiast</p>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    {isRu ? 'Физическая память, доступная Windows: ' : 'Physical memory available to Windows: '}
                    <strong className="text-gray-800 dark:text-gray-200 font-mono">2,096,624 KB</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setTab('bio')}
                className="px-5 py-1 text-xs border border-gray-400 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded shadow-sm font-medium"
              >
                {isRu ? 'Перейти к резюме →' : 'View Resume →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <MarkdownViewer title="Обо мне" categories={aboutCategories} />
          </div>
        )}
      </div>
    );
  }

  return <MarkdownViewer title="Обо мне" categories={aboutCategories} />;
}

