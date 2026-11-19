import { useEffect, useMemo, useState } from 'react';
import { type Language } from '../../../i18n/translations';
import { type ThemeId } from '../../../contexts/appContextTypes';
import { useNews } from '../../../domain/news/useNews';
import { ensureCalendarEvents, getCalendarEventsForDate, moveCalendarMonth, selectCalendarDate, useCalendarCenter } from '../../../apps/calendar/calendarCenter';
import { getHolidaysForDate, getHolidayTitle, isSelectedCountryWeekend, isMakeupWorkday, NATIONAL_COUNTRIES, useLabourCountries } from '../../../apps/calendar/nationalCalendars';
import flagRu from '../../../apps/langs/flag-ru.svg';
import flagKz from '../../../apps/langs/flag-kz.svg';
import flagBy from '../../../apps/langs/flag-by.svg';
import flagCn from '../../../apps/langs/flag-cn.svg';
import flagJp from '../../../apps/langs/flag-jp.svg';
import flagKr from '../../../apps/langs/flag-kr.svg';
import flagGb from '../../../apps/langs/flag-en.webp';
import { useArticles } from '../../../domain/articles/useArticles';

interface AppleNotificationCenterProps {
  open: boolean;
  theme: ThemeId;
  time: Date;
  language: Language;
  onClose: () => void;
  onOpenCalendar?: () => void;
}

export function AppleNotificationCenter({
  open,
  theme,
  time,
  language,
  onClose,
  onOpenCalendar,
}: AppleNotificationCenterProps) {
  const focusStorageKey = theme === 'macos-26' ? 'macos-focus-enabled' : 'ios-focus-enabled';
  const focusEventName = theme === 'macos-26' ? 'macos-focus-changed' : 'ios-focus-changed';
  const [focusMode, setFocusMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(focusStorageKey) === 'true';
  });
  const dismissedStorageKey =
    theme === 'macos-26' ? 'macos-dismissed-notifications' : 'ios-dismissed-notifications';
  const [dismissedKeys, setDismissedKeys] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(dismissedStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
    } catch {
      return [];
    }
  });
  const { news } = useNews();
  const { visibleMonth, selectedDate } = useCalendarCenter();
  const labourCountries = useLabourCountries();
  const countryFlags: Record<string, string> = { RU: flagRu, KZ: flagKz, BY: flagBy, CN: flagCn, JP: flagJp, KR: flagKr, GB: flagGb };
  useEffect(() => { void ensureCalendarEvents(language); }, [language]);
  const { articles } = useArticles();
  useEffect(() => {
    const handleFocusChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') setFocusMode(customEvent.detail);
    };

    window.addEventListener(focusEventName, handleFocusChange);
    return () => window.removeEventListener(focusEventName, handleFocusChange);
  }, [focusEventName]);

  useEffect(() => {
    setFocusMode(localStorage.getItem(focusStorageKey) === 'true');
  }, [focusStorageKey]);

  const updateFocusMode = (value: boolean) => {
    setFocusMode(value);
    localStorage.setItem(focusStorageKey, String(value));
    window.dispatchEvent(new CustomEvent(focusEventName, { detail: value }));
  };


  const updates = useMemo(() => {
    const items = [
      ...news.map((item) => ({
        key: `news:${item.id}`,
        kind: language === 'ru' ? 'Новости' : 'News',
        title: item.title,
        summary: item.content.replace(/[#>*_`\[\]()-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 130),
        date: item.date,
        path: item.route?.sitePath ?? item.route?.path,
      })),
      ...articles.map((item) => ({
        key: `article:${item.id}`,
        kind: language === 'ru' ? 'Блог' : 'Blog',
        title: item.title,
        summary: item.summary || item.content.replace(/[#>*_`\[\]()-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 130),
        date: item.updatedAt || item.date,
        path: item.articlePath ?? item.route?.sitePath ?? item.route?.path,
      })),
    ];

    return items
      .sort((a, b) => {
        const aTime = a.date ? Date.parse(a.date) : 0;
        const bTime = b.date ? Date.parse(b.date) : 0;
        return bTime - aTime;
      })
      .slice(0, 4);
  }, [articles, language, news]);

  const visibleUpdates = useMemo(
    () => updates.filter((update) => !dismissedKeys.includes(update.key)),
    [dismissedKeys, updates]
  );

  const dismissUpdate = (key: string) => {
    setDismissedKeys((current) => {
      if (current.includes(key)) return current;
      const next = [...current, key];
      localStorage.setItem(dismissedStorageKey, JSON.stringify(next));
      return next;
    });
  };

  const clearAllUpdates = () => {
    const next = Array.from(new Set([...dismissedKeys, ...updates.map((update) => update.key)]));
    setDismissedKeys(next);
    localStorage.setItem(dismissedStorageKey, JSON.stringify(next));
  };

  const calendarCells = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const mondayFirst = language === 'ru' || language === 'fr' || language === 'es';
    const offset = (new Date(year, month, 1).getDay() - (mondayFirst ? 1 : 0) + 7) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: count }, (_, index) => new Date(year, month, index + 1)),
    ];
  }, [visibleMonth, language]);

  const weekdays = useMemo(() => {
    const mondayFirst = language === 'ru' || language === 'fr' || language === 'es';
    return Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(language, { weekday: 'short' })
        .format(new Date(2024, 0, 7 + ((index + (mondayFirst ? 1 : 0)) % 7)))
        .replace('.', '')
    );
  }, [language]);
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const monthLabel = visibleMonth.toLocaleDateString(language, { month: 'long', year: 'numeric' });
  const selectedEvents = getCalendarEventsForDate(selectedDate);
  const openCalendarLabel: Record<string, string> = { ru: 'Открыть календарь', en: 'Open Calendar', fr: 'Ouvrir le calendrier', es: 'Abrir calendario', zh: '打开日历', ja: 'カレンダーを開く', ko: '캘린더 열기' };


  if (!open) return null;

  return (
    <div
      className="apple-notification-center"
      role="dialog"
      aria-label="Notification Center"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="apple-notification-center__backdrop"
        aria-label="Close Notification Center"
        onClick={onClose}
      />

      <div className="apple-notification-center__column">
        <section className="apple-notification-center__header-card">
          <div>
            <strong>
              {time.toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' })}
            </strong>
            <small>{time.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}</small>
          </div>
          <button
            type="button"
            className={focusMode ? 'is-active' : ''}
            onClick={() => updateFocusMode(!focusMode)}
            aria-pressed={focusMode}
          >
            {focusMode ? 'Focus On' : 'Focus'}
          </button>
        </section>

        <section className="apple-notification-center__notifications">
          <header>
            <strong>Notification Center</strong>
            <div className="apple-notification-center__header-actions">
              {!focusMode && visibleUpdates.length > 0 && (
                <button type="button" onClick={clearAllUpdates}>
                  {language === 'ru' ? 'Очистить' : 'Clear All'}
                </button>
              )}
              <span>{focusMode ? 0 : visibleUpdates.length}</span>
            </div>
          </header>
          {focusMode ? (
            <div className="apple-notification-center__empty">
              <span aria-hidden="true">☾</span>
              <strong>{language === 'ru' ? 'Уведомления заглушены' : 'Notifications Silenced'}</strong>
              <small>{language === 'ru' ? 'Режим фокусирования включён.' : 'Focus mode is currently enabled.'}</small>
            </div>
          ) : visibleUpdates.length > 0 ? (
            <div className="apple-notification-center__updates">
              {visibleUpdates.map((update) => (
                <article key={update.key} className="apple-notification-center__update">
                  <button
                    type="button"
                    className="apple-notification-center__update-open"
                    onClick={() => {
                      if (!update.path) return;
                      onClose();
                      window.location.href = update.path;
                    }}
                  >
                    <span className="apple-notification-center__update-icon">N</span>
                    <span className="apple-notification-center__update-copy">
                      <span>
                        <strong>NervaWEB WebOS</strong>
                        <small>{update.kind}</small>
                      </span>
                      <b>{update.title}</b>
                      <p>{update.summary}</p>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="apple-notification-center__dismiss"
                    aria-label={language === 'ru' ? 'Скрыть уведомление' : 'Dismiss notification'}
                    onClick={() => dismissUpdate(update.key)}
                  >
                    ×
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="apple-notification-center__empty">
              <span aria-hidden="true">◌</span>
              <strong>No Notifications</strong>
              <small>New notifications will appear here.</small>
            </div>
          )}
        </section>

        <section className="apple-notification-center__calendar">
          <header>
            <button type="button" aria-label={language === 'ru' ? 'Предыдущий месяц' : 'Previous month'} onClick={() => moveCalendarMonth(-1)}>‹</button>
            <strong>{monthLabel}</strong>
            <button type="button" aria-label={language === 'ru' ? 'Следующий месяц' : 'Next month'} onClick={() => moveCalendarMonth(1)}>›</button>
          </header>
          <div className="apple-notification-center__weekdays">
            {weekdays.map((weekday, index) => <span key={`${weekday}-${index}`}>{weekday}</span>)}
          </div>
          <div className="apple-notification-center__days">
            {calendarCells.map((date, index) => date === null ? (
              <span key={`empty-${index}`} />
            ) : (() => {
              const holidays = getHolidaysForDate(date);
              const weekend = isSelectedCountryWeekend(date, labourCountries);
              const makeupWork = isMakeupWorkday(date, labourCountries);
              const events = getCalendarEventsForDate(date);
              const tooltip = [
                weekend ? (language === 'ru' ? 'Выходной' : 'Day off') : '',
                makeupWork ? (language === 'ru' ? 'Рабочий день' : 'Working day') : '',
                ...holidays.map((holiday) => `${NATIONAL_COUNTRIES.find((country) => country.code === holiday.country)?.flag ?? ''} ${getHolidayTitle(holiday, language)}`),
                ...events.map((event) => event.summary),
              ].filter(Boolean).join(' · ');
              return <button
                type="button"
                key={date.toISOString()}
                className={`${sameDay(date, time) ? 'is-today' : ''} ${sameDay(date, selectedDate) ? 'is-selected' : ''} ${weekend ? 'is-labour-weekend' : ''} ${makeupWork ? 'is-makeup-workday' : ''} ${holidays.length ? 'has-national-holiday' : ''}`}
                title={tooltip || date.toLocaleDateString(language)}
                aria-pressed={sameDay(date, selectedDate)}
                onClick={() => selectCalendarDate(date)}
              >
                {date.getDate()}
                {(holidays.length > 0 || events.length > 0 || weekend || makeupWork) && <i aria-hidden="true" />}
              </button>;
            })())}
          </div>
          <div className="apple-notification-center__selected-day">
            <strong>{selectedDate.toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
            {getHolidaysForDate(selectedDate).map((holiday) => (
              <span key={holiday.id} className="apple-notification-center__holiday">
                {countryFlags[holiday.country] && <img src={countryFlags[holiday.country]} alt="" />}
                {getHolidayTitle(holiday, language)}
              </span>
            ))}
            {selectedEvents.slice(0, 3).map((event) => <span key={event.id} className="apple-notification-center__event">{event.summary}</span>)}
            {selectedEvents.length === 0 && getHolidaysForDate(selectedDate).length === 0 && (
              <small>{language === 'ru' ? 'Нет событий' : 'No events'}</small>
            )}
          </div>
          <button type="button" className="apple-notification-center__open-calendar" onClick={() => { onClose(); onOpenCalendar?.(); }}>
            {openCalendarLabel[language] ?? openCalendarLabel.en}
          </button>
        </section>
      </div>
    </div>
  );
}
