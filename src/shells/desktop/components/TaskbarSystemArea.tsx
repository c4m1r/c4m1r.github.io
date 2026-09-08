import { useEffect, useMemo, useState, type RefObject } from 'react';
import { type Language } from '../../../i18n/translations';
import { SystemActionMenu } from '../../../system/actions/SystemActionMenu';

export interface TaskbarSystemAreaProps {
  language: Language;
  isXpFamily: boolean;
  trayRef: RefObject<HTMLDivElement>;
  volumeLevel: number;
  showVolumePanel: boolean;
  showNotificationPanel: boolean;
  showSystemActionMenu: boolean;
  onVolumeToggle: () => void;
  onNotificationToggle: () => void;
  onSystemActionToggle: () => void;
  onVolumeLevelChange: (level: number) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  time: Date;
  volumeIconSrc: string;
  muteIconSrc: string;
  fullscreenIconSrc?: string;
  notificationIconSrc?: string;
  trayExpandIconSrc?: string;
}

interface TrayLabels {
  fullscreen: string;
  exitFullscreen: string;
  volume: string;
  notifications: string;
  noNotifications: string;
  systemActions: string;
  showHidden: string;
  hideHidden: string;
  dateTime: string;
  today: string;
  previousMonth: string;
  nextMonth: string;
}

const TRAY_LABELS: Record<Language, TrayLabels> = {
  en: {
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    volume: 'Volume',
    notifications: 'Notifications',
    noNotifications: 'No new notifications',
    systemActions: 'System Actions',
    showHidden: 'Show hidden icons',
    hideHidden: 'Hide hidden icons',
    dateTime: 'Date and Time',
    today: 'Today',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
  },
  ru: {
    fullscreen: 'Полноэкранный режим',
    exitFullscreen: 'Выйти из полноэкранного режима',
    volume: 'Громкость',
    notifications: 'Уведомления',
    noNotifications: 'Нет новых уведомлений',
    systemActions: 'Системные действия',
    showHidden: 'Показать скрытые значки',
    hideHidden: 'Скрыть значки',
    dateTime: 'Дата и время',
    today: 'Сегодня',
    previousMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
  },
  fr: {
    fullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
    volume: 'Volume',
    notifications: 'Notifications',
    noNotifications: 'Aucune nouvelle notification',
    systemActions: 'Actions système',
    showHidden: 'Afficher les icônes masquées',
    hideHidden: 'Masquer les icônes',
    dateTime: 'Date et heure',
    today: "Aujourd’hui",
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
  },
  es: {
    fullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    volume: 'Volumen',
    notifications: 'Notificaciones',
    noNotifications: 'No hay notificaciones nuevas',
    systemActions: 'Acciones del sistema',
    showHidden: 'Mostrar iconos ocultos',
    hideHidden: 'Ocultar iconos',
    dateTime: 'Fecha y hora',
    today: 'Hoy',
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
  },
  zh: {
    fullscreen: '全屏',
    exitFullscreen: '退出全屏',
    volume: '音量',
    notifications: '通知',
    noNotifications: '没有新通知',
    systemActions: '系统操作',
    showHidden: '显示隐藏的图标',
    hideHidden: '隐藏图标',
    dateTime: '日期和时间',
    today: '今天',
    previousMonth: '上个月',
    nextMonth: '下个月',
  },
  ja: {
    fullscreen: '全画面表示',
    exitFullscreen: '全画面表示を終了',
    volume: '音量',
    notifications: '通知',
    noNotifications: '新しい通知はありません',
    systemActions: 'システム操作',
    showHidden: '隠れているインジケーターを表示',
    hideHidden: 'インジケーターを隠す',
    dateTime: '日付と時刻',
    today: '今日',
    previousMonth: '前の月',
    nextMonth: '次の月',
  },
  ko: {
    fullscreen: '전체 화면',
    exitFullscreen: '전체 화면 종료',
    volume: '볼륨',
    notifications: '알림',
    noNotifications: '새 알림 없음',
    systemActions: '시스템 작업',
    showHidden: '숨겨진 아이콘 표시',
    hideHidden: '아이콘 숨기기',
    dateTime: '날짜 및 시간',
    today: '오늘',
    previousMonth: '이전 달',
    nextMonth: '다음 달',
  },
};

function areSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function XpClockCalendarPopup({
  language,
  time,
  labels,
}: {
  language: Language;
  time: Date;
  labels: TrayLabels;
}) {
  const [monthCursor, setMonthCursor] = useState(
    () => new Date(time.getFullYear(), time.getMonth(), 1),
  );

  const weekStartsOnMonday = language === 'ru' || language === 'fr' || language === 'es';
  const weekStart = weekStartsOnMonday ? 1 : 0;

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(language, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, index) => {
      const dayOffset = (weekStart + index) % 7;
      return formatter.format(new Date(2024, 0, 7 + dayOffset)).replace('.', '');
    });
  }, [language, weekStart]);

  const calendarCells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const leadingEmpty = (firstWeekday - weekStart + 7) % 7;
    const dayCount = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: leadingEmpty }, () => null),
      ...Array.from({ length: dayCount }, (_, index) => new Date(year, month, index + 1)),
    ];
  }, [monthCursor, weekStart]);

  const monthLabel = new Intl.DateTimeFormat(language, {
    month: 'long',
    year: 'numeric',
  }).format(monthCursor);

  const hourRotation = ((time.getHours() % 12) + time.getMinutes() / 60) * 30;
  const minuteRotation = (time.getMinutes() + time.getSeconds() / 60) * 6;
  const secondRotation = time.getSeconds() * 6;

  return (
    <div
      className="xp-clock-popup"
      role="dialog"
      aria-label={labels.dateTime}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="xp-clock-popup__header">
        <div>
          <div className="xp-clock-popup__title">{labels.dateTime}</div>
          <div className="xp-clock-popup__date">
            {new Intl.DateTimeFormat(language, { dateStyle: 'full' }).format(time)}
          </div>
        </div>
        <div className="xp-analog-clock" aria-hidden="true">
          <span className="xp-analog-clock__center" />
          <span
            className="xp-analog-clock__hand xp-analog-clock__hand--hour"
            style={{ transform: `translateX(-50%) rotate(${hourRotation}deg)` }}
          />
          <span
            className="xp-analog-clock__hand xp-analog-clock__hand--minute"
            style={{ transform: `translateX(-50%) rotate(${minuteRotation}deg)` }}
          />
          <span
            className="xp-analog-clock__hand xp-analog-clock__hand--second"
            style={{ transform: `translateX(-50%) rotate(${secondRotation}deg)` }}
          />
        </div>
      </div>

      <div className="xp-clock-popup__digital">
        {time.toLocaleTimeString(language, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </div>

      <div className="xp-clock-popup__calendar">
        <div className="xp-clock-popup__month-row">
          <button
            type="button"
            onClick={() =>
              setMonthCursor((current) =>
                new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
            aria-label={labels.previousMonth}
            title={labels.previousMonth}
          >
            ‹
          </button>
          <span>{monthLabel}</span>
          <button
            type="button"
            onClick={() =>
              setMonthCursor((current) =>
                new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
            aria-label={labels.nextMonth}
            title={labels.nextMonth}
          >
            ›
          </button>
        </div>

        <div className="xp-clock-popup__weekdays">
          {weekdayLabels.map((weekday, index) => (
            <span key={`${weekday}-${index}`}>{weekday}</span>
          ))}
        </div>

        <div className="xp-clock-popup__days">
          {calendarCells.map((date, index) =>
            date ? (
              <span
                key={date.toISOString()}
                className={areSameDay(date, time) ? 'is-today' : ''}
                title={areSameDay(date, time) ? labels.today : undefined}
              >
                {date.getDate()}
              </span>
            ) : (
              <span key={`empty-${index}`} aria-hidden="true" />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export function TaskbarSystemArea({
  language,
  isXpFamily,
  trayRef,
  volumeLevel,
  showVolumePanel,
  showNotificationPanel,
  showSystemActionMenu,
  onVolumeToggle,
  onNotificationToggle,
  onSystemActionToggle,
  onVolumeLevelChange,
  isFullscreen,
  onFullscreenToggle,
  time,
  volumeIconSrc,
  muteIconSrc,
  fullscreenIconSrc,
  notificationIconSrc,
  trayExpandIconSrc,
}: TaskbarSystemAreaProps) {
  const [hiddenTrayExpanded, setHiddenTrayExpanded] = useState(false);
  const [showClockPanel, setShowClockPanel] = useState(false);
  const labels = TRAY_LABELS[language] ?? TRAY_LABELS.en;

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        setShowClockPanel(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowClockPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [trayRef]);

  useEffect(() => {
    if (!isXpFamily) {
      setHiddenTrayExpanded(false);
    }
  }, [isXpFamily]);

  const closeOtherPanels = () => {
    if (showVolumePanel) onVolumeToggle();
    if (showNotificationPanel) onNotificationToggle();
    if (showSystemActionMenu) onSystemActionToggle();
  };

  const handleClockToggle = () => {
    setShowClockPanel((current) => {
      if (!current) closeOtherPanels();
      return !current;
    });
  };

  const handleTrayExpandToggle = () => {
    setHiddenTrayExpanded((current) => {
      if (current) {
        if (showNotificationPanel) onNotificationToggle();
        if (showSystemActionMenu) onSystemActionToggle();
      }
      return !current;
    });
    setShowClockPanel(false);
  };

  const fullscreenControl = fullscreenIconSrc ? (
    <button
      type="button"
      onClick={() => {
        setShowClockPanel(false);
        onFullscreenToggle();
      }}
      className="taskbar-tray-icon"
      title={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
      aria-label={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
    >
      <img src={fullscreenIconSrc} alt="" className="w-4 h-4" />
    </button>
  ) : null;

  const notificationControl = (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setShowClockPanel(false);
          onNotificationToggle();
        }}
        className="taskbar-tray-icon"
        title={labels.notifications}
        aria-label={labels.notifications}
      >
        {notificationIconSrc && (
          <img src={notificationIconSrc} alt="" className="w-4 h-4" />
        )}
      </button>
      {showNotificationPanel && (
        <div className="absolute right-0 bottom-full mb-2 w-48 rounded-lg border border-[#90aee6] bg-[#fefefe] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.35)] text-[11px] text-[#1b1b1b] z-50">
          {labels.noNotifications}
        </div>
      )}
    </div>
  );

  const systemActionControl = (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setShowClockPanel(false);
          onSystemActionToggle();
        }}
        className="taskbar-tray-icon system-action-trigger"
        title={labels.systemActions}
        aria-label={labels.systemActions}
      >
        <span className="text-xs" aria-hidden="true">⚡</span>
      </button>
      <SystemActionMenu
        isOpen={showSystemActionMenu}
        onClose={onSystemActionToggle}
      />
    </div>
  );

  return (
    <div className="taskbar-system-area relative flex h-full items-center gap-1.5">
      {isXpFamily && trayExpandIconSrc && (
        <button
          type="button"
          onClick={handleTrayExpandToggle}
          className={`taskbar-tray-icon taskbar-tray-icon--compact taskbar-tray-expand ${hiddenTrayExpanded ? 'is-open' : ''}`}
          title={hiddenTrayExpanded ? labels.hideHidden : labels.showHidden}
          aria-label={hiddenTrayExpanded ? labels.hideHidden : labels.showHidden}
          aria-expanded={hiddenTrayExpanded}
        >
          <img src={trayExpandIconSrc} alt="" className="w-3 h-3" />
        </button>
      )}

      {isXpFamily ? (
        <div className={`xp-tray-hidden-icons ${hiddenTrayExpanded ? 'is-open' : ''}`} aria-hidden={!hiddenTrayExpanded}>
          {fullscreenControl}
          {notificationControl}
          {systemActionControl}
        </div>
      ) : (
        <>
          {fullscreenControl}
          {notificationControl}
          {systemActionControl}
        </>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowClockPanel(false);
            onVolumeToggle();
          }}
          className="taskbar-tray-icon"
          title={labels.volume}
          aria-label={labels.volume}
        >
          <img
            src={volumeLevel === 0 ? muteIconSrc : volumeIconSrc}
            alt=""
            className="w-4 h-4"
          />
        </button>
        {showVolumePanel && (
          <div className="absolute right-0 bottom-full mb-2 w-32 rounded-lg border border-[#90aee6] bg-[#fefefe] px-3 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.35)] flex items-center gap-3 z-50">
            <img
              src={volumeLevel === 0 ? muteIconSrc : volumeIconSrc}
              alt=""
              className="volume-panel__icon w-4 h-4"
            />
            <div className="volume-slider-wrapper">
              <input
                type="range"
                min={0}
                max={100}
                value={volumeLevel}
                onChange={(event) => onVolumeLevelChange(Number(event.currentTarget.value))}
                className="volume-slider"
                aria-label={labels.volume}
              />
            </div>
          </div>
        )}
      </div>

      <div className="relative h-full">
        <button
          type="button"
          onClick={handleClockToggle}
          className={`taskbar-tray-time ${showClockPanel ? 'is-open' : ''}`}
          aria-label={labels.dateTime}
          aria-expanded={showClockPanel}
          title={labels.dateTime}
        >
          <span
            className="text-[11px] font-semibold tracking-wide uppercase"
            style={{ textShadow: '0 1px 0 rgba(0,0,0,0.4)', letterSpacing: '0.05em' }}
          >
            {time.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
          </span>
        </button>

        {showClockPanel && (
          <XpClockCalendarPopup language={language} time={time} labels={labels} />
        )}
      </div>
    </div>
  );
}
