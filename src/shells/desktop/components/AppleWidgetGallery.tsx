import { useEffect, useState } from 'react';
import { Battery, Calendar, TrendingUp, Clock, CloudSun, Cpu, Image, MessageCircle, Music, Newspaper, Moon, Sun, type LucideIcon } from 'lucide-react';
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
  classicWinampOpen: boolean;
  onToggleClassicWinamp: () => void;
}

const widgets: Array<{
  key: keyof AppleWidgetVisibility;
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  icon: LucideIcon;
}> = [
  { key: 'clock', title: 'Clock', titleRu: 'Часы', description: 'Current time and date', descriptionRu: 'Текущее время и дата', icon: Clock },
  { key: 'calendar', title: 'Calendar', titleRu: 'Календарь', description: 'Current month calendar', descriptionRu: 'Календарь на текущий месяц', icon: Calendar },
  { key: 'battery', title: 'Battery', titleRu: 'Батарея', description: 'Device battery status', descriptionRu: 'Состояние аккумулятора', icon: Battery },
  { key: 'weather', title: 'Weather', titleRu: 'Погода', description: 'Open-Meteo live forecast', descriptionRu: 'Прогноз погоды Open-Meteo', icon: CloudSun },
  { key: 'winamp', title: 'Winamp Now Playing', titleRu: 'Winamp Плеер', description: 'Glassmorphic music player', descriptionRu: 'Компактный музыкальный плеер', icon: Music },
  { key: 'quotes', title: 'Quotes', titleRu: 'Цитаты', description: 'Wise & gaming quotes', descriptionRu: 'Мудрые и игровые цитаты', icon: MessageCircle },
  { key: 'currency', title: 'Market Rates', titleRu: 'Курсы валют', description: 'BTC, USD, RUB, Gold to KZT', descriptionRu: 'BTC, USD, RUB, Золото к KZT', icon: TrendingUp },
  { key: 'monitor', title: 'System Monitor', titleRu: 'Монитор системы', description: 'Live CPU, RAM & Disk usage', descriptionRu: 'Загрузка CPU, памяти и диска', icon: Cpu },
  { key: 'news', title: 'News RSS', titleRu: 'Новости RSS', description: 'Interactive news headlines', descriptionRu: 'Лента игровых и IT новостей', icon: Newspaper },
  { key: 'gallery', title: 'Art Gallery', titleRu: 'Галерея', description: 'Curated artwork frame', descriptionRu: 'Рамка избранных иллюстраций', icon: Image },
];

export function AppleWidgetGallery({ open, visibility, onClose, onToggle, onPresetChange, themeKey, webosVisibility, classicWinampOpen, onToggleClassicWinamp }: AppleWidgetGalleryProps) {
  const { language } = useApp();
  const locale = ({
    en: { title: 'Desktop Widgets', done: 'Done', nightMode: 'Night mode', lightMode: 'Light mode', on: 'On', off: 'Off', size: 'View / size', compact: 'Compact', standard: 'Standard', wide: 'Wide', clockCalendar: 'Clock & calendar', combinedDescription: 'Combined time and calendar widget', widgets: [['Clock', 'Current time and date'], ['Calendar', 'Current month calendar'], ['Battery', 'Device battery status'], ['Weather', 'Current weather forecast'], ['Winamp Now Playing', 'Compact music player'], ['Quotes', 'Quotes and sayings'], ['Market Rates', 'Currency and market rates'], ['System Monitor', 'CPU, memory and disk usage'], ['News RSS', 'RSS news headlines'], ['Art Gallery', 'Selected artwork']] },
    ru: { title: 'Виджеты рабочего стола', done: 'Готово', nightMode: 'Ночной режим', lightMode: 'Дневной режим', on: 'Вкл', off: 'Выкл', size: 'Вид / размер', compact: 'Компактный', standard: 'Стандартный', wide: 'Широкий', clockCalendar: 'Часы и календарь', combinedDescription: 'Комбинированный виджет времени и календаря', widgets: [['Часы', 'Текущее время и дата'], ['Календарь', 'Календарь на текущий месяц'], ['Батарея', 'Состояние аккумулятора'], ['Погода', 'Текущий прогноз погоды'], ['Winamp — сейчас играет', 'Компактный музыкальный плеер'], ['Цитаты', 'Цитаты и высказывания'], ['Курсы валют', 'Курсы валют и рынков'], ['Монитор системы', 'Загрузка процессора, памяти и диска'], ['Новости RSS', 'Заголовки RSS-лент'], ['Галерея', 'Избранные иллюстрации']] },
    fr: { title: 'Widgets du bureau', done: 'Terminé', nightMode: 'Mode nuit', lightMode: 'Mode clair', on: 'Activé', off: 'Désactivé', size: 'Affichage / taille', compact: 'Compact', standard: 'Standard', wide: 'Large', clockCalendar: 'Horloge et calendrier', combinedDescription: 'Widget combinant heure et calendrier', widgets: [['Horloge', 'Heure et date actuelles'], ['Calendrier', 'Calendrier du mois'], ['Batterie', 'État de la batterie'], ['Météo', 'Prévisions météo'], ['Winamp — lecture', 'Lecteur musical compact'], ['Citations', 'Citations et pensées'], ['Marchés', 'Devises et marchés'], ['Moniteur système', 'Processeur, mémoire et disque'], ['Actualités RSS', 'Titres des flux RSS'], ['Galerie', 'Œuvres sélectionnées']] },
    es: { title: 'Widgets del escritorio', done: 'Listo', nightMode: 'Modo nocturno', lightMode: 'Modo claro', on: 'Activado', off: 'Desactivado', size: 'Vista / tamaño', compact: 'Compacto', standard: 'Estándar', wide: 'Ancho', clockCalendar: 'Reloj y calendario', combinedDescription: 'Widget combinado de hora y calendario', widgets: [['Reloj', 'Hora y fecha actuales'], ['Calendario', 'Calendario del mes'], ['Batería', 'Estado de la batería'], ['Tiempo', 'Pronóstico del tiempo'], ['Winamp — reproducción', 'Reproductor de música compacto'], ['Citas', 'Citas y pensamientos'], ['Mercados', 'Divisas y mercados'], ['Monitor del sistema', 'CPU, memoria y disco'], ['Noticias RSS', 'Titulares RSS'], ['Galería', 'Obras seleccionadas']] },
    zh: { title: '桌面小组件', done: '完成', nightMode: '夜间模式', lightMode: '日间模式', on: '开启', off: '关闭', size: '视图 / 大小', compact: '紧凑', standard: '标准', wide: '宽屏', clockCalendar: '时钟和日历', combinedDescription: '时间与日历组合小组件', widgets: [['时钟', '当前时间和日期'], ['日历', '本月日历'], ['电池', '设备电池状态'], ['天气', '天气预报'], ['Winamp 正在播放', '迷你音乐播放器'], ['名言', '名言和短句'], ['市场行情', '汇率和市场行情'], ['系统监视器', 'CPU、内存和磁盘使用情况'], ['RSS 新闻', 'RSS 新闻标题'], ['艺术画廊', '精选艺术作品']] },
    ja: { title: 'デスクトップウィジェット', done: '完了', nightMode: 'ナイトモード', lightMode: 'ライトモード', on: 'オン', off: 'オフ', size: '表示 / サイズ', compact: 'コンパクト', standard: '標準', wide: 'ワイド', clockCalendar: '時計とカレンダー', combinedDescription: '時刻とカレンダーの複合ウィジェット', widgets: [['時計', '現在の時刻と日付'], ['カレンダー', '今月のカレンダー'], ['バッテリー', 'バッテリー状態'], ['天気', '現在の天気予報'], ['Winamp 再生中', 'コンパクト音楽プレーヤー'], ['名言', '名言とことば'], ['市場レート', '為替と市場レート'], ['システムモニター', 'CPU、メモリ、ディスク使用量'], ['RSS ニュース', 'RSS ニュース見出し'], ['アートギャラリー', '選択された作品']] },
    ko: { title: '바탕 화면 위젯', done: '완료', nightMode: '야간 모드', lightMode: '라이트 모드', on: '켜짐', off: '꺼짐', size: '보기 / 크기', compact: '간단히', standard: '표준', wide: '넓게', clockCalendar: '시계 및 달력', combinedDescription: '시간과 달력을 결합한 위젯', widgets: [['시계', '현재 시간 및 날짜'], ['달력', '이번 달 달력'], ['배터리', '기기 배터리 상태'], ['날씨', '현재 날씨 예보'], ['Winamp 재생 중', '소형 음악 플레이어'], ['명언', '명언과 문구'], ['시장 시세', '환율 및 시장 시세'], ['시스템 모니터', 'CPU, 메모리 및 디스크 사용량'], ['RSS 뉴스', 'RSS 뉴스 제목'], ['아트 갤러리', '선택된 작품']] },
    be: { title: 'Віджэты працоўнага стала', done: 'Гатова', nightMode: 'Начны рэжым', lightMode: 'Дзённы рэжым', on: 'Укл.', off: 'Выкл.', size: 'Выгляд / памер', compact: 'Кампактны', standard: 'Стандартны', wide: 'Шырокі', clockCalendar: 'Гадзіннік і каляндар', combinedDescription: 'Аб’яднаны віджэт часу і календара', widgets: [['Гадзіннік', 'Бягучы час і дата'], ['Каляндар', 'Каляндар бягучага месяца'], ['Батарэя', 'Стан акумулятара'], ['Надвор’е', 'Бягучы прагноз надвор’я'], ['Winamp — прайграванне', 'Кампактны музычны плэер'], ['Цытаты', 'Цытаты і выслоўі'], ['Курсы валют', 'Курсы валют і рынкаў'], ['Манітор сістэмы', 'Загрузка працэсара, памяці і дыска'], ['Навіны RSS', 'Загалоўкі RSS-стужак'], ['Галерэя', 'Абраныя ілюстрацыі']] },
    kk: { title: 'Жұмыс үстелі виджеттері', done: 'Дайын', nightMode: 'Түнгі режим', lightMode: 'Күндізгі режим', on: 'Қосулы', off: 'Өшірулі', size: 'Көрініс / өлшем', compact: 'Ықшам', standard: 'Стандартты', wide: 'Кең', clockCalendar: 'Сағат және күнтізбе', combinedDescription: 'Уақыт пен күнтізбені біріктіретін виджет', widgets: [['Сағат', 'Ағымдағы уақыт пен күн'], ['Күнтізбе', 'Ағымдағы ай күнтізбесі'], ['Батарея', 'Құрылғы батареясының күйі'], ['Ауа райы', 'Ауа райы болжамы'], ['Winamp — ойнатылуда', 'Ықшам музыка ойнатқышы'], ['Дәйексөздер', 'Дәйексөздер мен нақыл сөздер'], ['Нарық бағамдары', 'Валюта және нарық бағамдары'], ['Жүйе мониторы', 'Процессор, жад және диск жүктемесі'], ['RSS жаңалықтары', 'RSS жаңалық тақырыптары'], ['Өнер галереясы', 'Таңдалған суреттер']] },
  } as Record<string, { title: string; done: string; nightMode: string; lightMode: string; on: string; off: string; size: string; compact: string; standard: string; wide: string; clockCalendar: string; combinedDescription: string; widgets: string[][] }>)[language] ?? ({
    title: 'Desktop Widgets', done: 'Done', nightMode: 'Night mode', lightMode: 'Light mode', on: 'On', off: 'Off', size: 'View / size', compact: 'Compact', standard: 'Standard', wide: 'Wide', clockCalendar: 'Clock & calendar', combinedDescription: 'Combined time and calendar widget', widgets: [['Clock', 'Current time and date'], ['Calendar', 'Current month calendar'], ['Battery', 'Device battery status'], ['Weather', 'Current weather forecast'], ['Winamp Now Playing', 'Compact music player'], ['Quotes', 'Quotes and sayings'], ['Market Rates', 'Currency and market rates'], ['System Monitor', 'CPU, memory and disk usage'], ['News RSS', 'RSS news headlines'], ['Art Gallery', 'Selected artwork']],
  });
  const classicWinampLabels: Record<string, { title: string; description: string }> = {
    ru: { title: 'Классический Winamp', description: 'Главное окно, эквалайзер и плейлист в стиле Winamp 2' },
    en: { title: 'Classic Winamp', description: 'Classic player, equalizer and playlist windows' },
  };
  const classicWinampLabel = classicWinampLabels[language] ?? classicWinampLabels.en;
  const galleryTitle = themeKey === 'win7'
    ? ({
        en: 'Desktop Gadget Gallery', ru: 'Галерея гаджетов', fr: 'Galerie des gadgets', es: 'Galería de gadgets',
        zh: '桌面小工具库', ja: 'デスクトップ ガジェット ギャラリー', ko: '데스크톱 가젯 갤러리',
        be: 'Галерэя гаджэтаў', kk: 'Жұмыс үстелі гаджеттерінің галереясы',
      } as Record<string, string>)[language] ?? 'Desktop Gadget Gallery'
    : locale.title;
  const [nightMode, setNightMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return window.localStorage.getItem('desktop-widget-gallery-night-mode') === 'true'; } catch { return false; }
  });
  const [selectedPresets, setSelectedPresets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('desktop-widget-layout-v3:' + themeKey);
      const saved = raw ? JSON.parse(raw) as Record<string, { preset?: string }> : {};
      setSelectedPresets(Object.fromEntries(Object.entries(saved).flatMap(([id, value]) =>
        typeof value?.preset === 'string' ? [[id, value.preset]] : []
      )));
    } catch {
      setSelectedPresets({});
    }
  }, [open, themeKey]);

  useEffect(() => {
    const syncPresets = (event?: Event) => {
      const detail = event instanceof CustomEvent ? event.detail as { themeKey?: string } | undefined : undefined;
      if (detail?.themeKey && detail.themeKey !== themeKey) return;
      try {
        const raw = localStorage.getItem('desktop-widget-layout-v3:' + themeKey);
        const saved = raw ? JSON.parse(raw) as Record<string, { preset?: string }> : {};
        setSelectedPresets(Object.fromEntries(Object.entries(saved).flatMap(([id, value]) =>
          typeof value?.preset === 'string' ? [[id, value.preset]] : []
        )));
      } catch {
        setSelectedPresets({});
      }
    };
    window.addEventListener('desktop-widget-layout-updated', syncPresets);
    return () => window.removeEventListener('desktop-widget-layout-updated', syncPresets);
  }, [themeKey]);

  const combinedClock = themeKey === 'webos' ? Boolean(webosVisibility.clock) : visibility.clock && visibility.calendar;
  const getPresetValue = (key: keyof AppleWidgetVisibility) => {
    const id = (key === 'clock' || key === 'calendar') && combinedClock ? 'clockCalendar' : key;
    return selectedPresets[id] ?? (themeKey === 'webos' ? 'compact' : 'standard');
  };
  const handlePresetChange = (key: keyof AppleWidgetVisibility, presetId: string) => {
    onPresetChange?.(key, presetId);
  };
  const toggleNightMode = () => {
    const next = !nightMode;
    setNightMode(next);
    try { window.localStorage.setItem('desktop-widget-gallery-night-mode', String(next)); } catch { /* Keep the session preference. */ }
  };

  if (!open) return null;

  const osFamily = themeKey.startsWith('win')
    ? 'windows'
    : themeKey === 'ubuntu'
      ? 'ubuntu'
      : themeKey === 'arch'
        ? 'arch'
        : themeKey === 'webos'
          ? 'webos'
          : themeKey.startsWith('macos')
            ? 'macos'
            : 'generic';

  return (
    <div className={`apple-widget-gallery apple-widget-gallery--${osFamily} ${nightMode ? 'is-night' : ''}`} role="dialog" aria-label={galleryTitle}>
      <button type="button" className="apple-widget-gallery__backdrop" aria-label={locale.done} onClick={onClose} />
      <section className="apple-widget-gallery__panel" onClick={(event) => event.stopPropagation()}>
        <header>
          <div><strong>{galleryTitle}</strong><small>{themeKey === 'webos' ? 'WebOS' : themeKey === 'win7' ? 'Windows 7' : themeKey.startsWith('win') ? 'Windows' : themeKey.startsWith('macos') ? 'macOS' : themeKey === 'ubuntu' ? 'Ubuntu' : themeKey === 'arch' ? 'Arch Linux' : 'Linux'}</small></div>
          <div className="apple-widget-gallery__header-actions">
            <button type="button" className="apple-widget-gallery__night-toggle" aria-label={nightMode ? locale.lightMode : locale.nightMode} aria-pressed={nightMode} onClick={toggleNightMode}>{nightMode ? <Sun size={15} /> : <Moon size={15} />}</button>
            <button type="button" onClick={onClose}>{locale.done}</button>
          </div>
        </header>
        <div className="apple-widget-gallery__list">
          <div className={`apple-widget-gallery__item ${classicWinampOpen ? 'is-enabled' : ''}`}>
            <button type="button" className="apple-widget-gallery__toggle" onClick={onToggleClassicWinamp} aria-pressed={classicWinampOpen}>
              <span className="apple-widget-gallery__glyph"><Music size={19} strokeWidth={1.8} aria-hidden="true" /></span>
              <span><strong>{classicWinampLabel.title}</strong><small>{classicWinampLabel.description}</small></span>
              <i>{classicWinampOpen ? locale.on : locale.off}</i>
            </button>
          </div>
          {widgets.filter((widget) => {
            if (themeKey === 'webos') return widget.key !== 'battery' && widget.key !== 'calendar';
            if (visibility.clock && visibility.calendar && widget.key === 'calendar') return false;
            return true;
          }).map((widget) => {
            const isCombinedClock = widget.key === 'clock' && (themeKey === 'webos' ? Boolean(webosVisibility.clock) : visibility.clock && visibility.calendar);
            const isEnabled = themeKey === 'webos' ? Boolean(webosVisibility[widget.key as keyof DesktopWidgetsVisibility]) : Boolean(visibility[widget.key]);
            const widgetIndex = widgets.findIndex((entry) => entry.key === widget.key);
            const displayTitle = isCombinedClock ? locale.clockCalendar : (locale.widgets[widgetIndex]?.[0] ?? widget.title);
            const displayDescription = isCombinedClock ? locale.combinedDescription : (locale.widgets[widgetIndex]?.[1] ?? widget.description);
            const toggleWidget = () => {
              if (isCombinedClock && themeKey !== 'webos') {
                onToggle('clock');
                onToggle('calendar');
              } else {
                onToggle(widget.key);
              }
            };
            return (
              <div className={`apple-widget-gallery__item ${isEnabled ? 'is-enabled' : ''}`} key={widget.key}>
                <button type="button" className="apple-widget-gallery__toggle" onClick={toggleWidget} aria-pressed={isEnabled}>
                  <span className="apple-widget-gallery__glyph"><widget.icon size={19} strokeWidth={1.8} aria-hidden="true" /></span>
                  <span><strong>{displayTitle}</strong><small>{displayDescription}</small></span>
                  <i>{isEnabled ? locale.on : locale.off}</i>
                </button>
                <label className="apple-widget-gallery__preset">
                  <span>{locale.size}</span>
                  <select value={getPresetValue(widget.key)} disabled={!isEnabled} onChange={(event) => handlePresetChange(widget.key, event.target.value)}>
                    <option value="compact">{locale.compact}</option>
                    <option value="standard">{locale.standard}</option>
                    <option value="wide">{locale.wide}</option>
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
