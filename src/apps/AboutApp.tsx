import { MarkdownViewer, MarkdownCategory } from './MarkdownViewer';
import { useApp } from '../contexts/useApp';

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
  const { theme } = useApp();

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
          onClick={() => window.dispatchEvent(new CustomEvent('webos:open-settings'))}
        >
          More Info…
        </button>

        <footer>
          Pseudo-emulation interface for development and compatibility testing.
        </footer>
      </div>
    );
  }

  return <MarkdownViewer title="Обо мне" categories={aboutCategories} />;
}

