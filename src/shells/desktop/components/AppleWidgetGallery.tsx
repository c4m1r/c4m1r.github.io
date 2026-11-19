import { useApp } from '../../../contexts/useApp';
import { type AppleWidgetVisibility } from './AppleDesktopWidgets';
import { type DesktopWidgetsVisibility } from '../../../system/widgets/types';

interface AppleWidgetGalleryProps {
  open: boolean;
  visibility: AppleWidgetVisibility;
  onClose: () => void;
  onToggle: (key: keyof AppleWidgetVisibility) => void;
  onPresetChange?: (key: keyof AppleWidgetVisibility, presetId: string) => void;
  webosVisibility: DesktopWidgetsVisibility;
  themeKey: string;
}

const widgets: Array<{
  key: keyof AppleWidgetVisibility;
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  glyph: string;
}> = [
  { key: 'clock', title: 'Clock', titleRu: 'Часы', description: 'Current time and date', descriptionRu: 'Текущее время и дата', glyph: '⏰' },
  { key: 'calendar', title: 'Calendar', titleRu: 'Календарь', description: 'Current month calendar', descriptionRu: 'Календарь на текущий месяц', glyph: '📅' },
  { key: 'battery', title: 'Battery', titleRu: 'Батарея', description: 'Device battery status', descriptionRu: 'Состояние аккумулятора', glyph: '🔋' },
  { key: 'weather', title: 'Weather', titleRu: 'Погода', description: 'Open-Meteo live forecast', descriptionRu: 'Прогноз погоды Open-Meteo', glyph: '⛅' },
  { key: 'winamp', title: 'Winamp Now Playing', titleRu: 'Winamp Плеер', description: 'Glassmorphic music player', descriptionRu: 'Компактный музыкальный плеер', glyph: '🎵' },
  { key: 'quotes', title: 'Quotes', titleRu: 'Цитаты', description: 'Wise & gaming quotes', descriptionRu: 'Мудрые и игровые цитаты', glyph: '💬' },
  { key: 'currency', title: 'Market Rates', titleRu: 'Курсы валют', description: 'BTC, USD, RUB, Gold to KZT', descriptionRu: 'BTC, USD, RUB, Золото к KZT', glyph: '📈' },
  { key: 'monitor', title: 'System Monitor', titleRu: 'Монитор системы', description: 'Live CPU, RAM & Disk usage', descriptionRu: 'Загрузка CPU, памяти и диска', glyph: '⚡' },
  { key: 'news', title: 'News RSS', titleRu: 'Новости RSS', description: 'Interactive news headlines', descriptionRu: 'Лента игровых и IT новостей', glyph: '📰' },
  { key: 'gallery', title: 'Art Gallery', titleRu: 'Галерея', description: 'Curated artwork frame', descriptionRu: 'Рамка избранных иллюстраций', glyph: '🖼️' },
];

export function AppleWidgetGallery({ open, visibility, onClose, onToggle, onPresetChange, themeKey, webosVisibility }: AppleWidgetGalleryProps) {
  const { language } = useApp();
  const isRu = language === 'ru';
  if (!open) return null;

  return (
    <div className={`apple-widget-gallery apple-widget-gallery--${themeKey.startsWith('win') ? 'windows' : themeKey.startsWith('linux') || themeKey === 'webos' ? themeKey : themeKey.startsWith('macos') ? 'macos' : 'generic'}`} role="dialog" aria-label={isRu ? 'Галерея виджетов' : 'Edit Widgets'}>
      <button type="button" className="apple-widget-gallery__backdrop" aria-label={isRu ? 'Закрыть' : 'Close'} onClick={onClose} />
      <section className="apple-widget-gallery__panel" onClick={(event) => event.stopPropagation()}>
        <header>
          <div><strong>{isRu ? 'Галерея виджетов' : 'Edit Widgets'}</strong><small>{themeKey === 'webos' ? 'WebOS' : themeKey.startsWith('macos') ? 'macOS' : themeKey.startsWith('win') ? 'Windows' : 'Linux'}</small></div>
          <button type="button" onClick={onClose}>{isRu ? 'Готово' : 'Done'}</button>
        </header>
        <div className="apple-widget-gallery__list">
          {widgets.filter((widget) => themeKey !== 'webos' || (widget.key !== 'battery' && widget.key !== 'calendar')).map((widget) => {
            const isEnabled = themeKey === 'webos' ? Boolean(webosVisibility[widget.key as keyof DesktopWidgetsVisibility]) : Boolean(visibility[widget.key]);
            return (
              <div className={`apple-widget-gallery__item ${isEnabled ? 'is-enabled' : ''}`} key={widget.key}>
                <button type="button" className="apple-widget-gallery__toggle" onClick={() => onToggle(widget.key)} aria-pressed={isEnabled}>
                  <span className="apple-widget-gallery__glyph">{widget.glyph}</span>
                  <span><strong>{isRu ? widget.titleRu : widget.title}</strong><small>{isRu ? widget.descriptionRu : widget.description}</small></span>
                  <i>{isEnabled ? (isRu ? 'Вкл' : 'On') : (isRu ? 'Выкл' : 'Off')}</i>
                </button>
                <label className="apple-widget-gallery__preset">
                  <span>{isRu ? 'Вид / размер' : 'View / size'}</span>
                  <select defaultValue="standard" disabled={!isEnabled} onChange={(event) => onPresetChange?.(widget.key, event.target.value)}>
                    <option value="compact">{isRu ? 'Компактный' : 'Compact'}</option>
                    <option value="standard">{isRu ? 'Стандартный' : 'Standard'}</option>
                    <option value="wide">{isRu ? 'Широкий' : 'Wide'}</option>
                  </select>
                </label>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
