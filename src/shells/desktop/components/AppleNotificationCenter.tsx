import { useEffect, useMemo, useState } from 'react';
import { type Language } from '../../../i18n/translations';
import { useNews } from '../../../domain/news/useNews';
import { useArticles } from '../../../domain/articles/useArticles';

interface AppleNotificationCenterProps {
  open: boolean;
  time: Date;
  language: Language;
  onClose: () => void;
}

export function AppleNotificationCenter({
  open,
  time,
  language,
  onClose,
}: AppleNotificationCenterProps) {
  const [focusMode, setFocusMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ios-focus-enabled') === 'true';
  });
  const { news } = useNews();
  const { articles } = useArticles();
  useEffect(() => {
    const handleFocusChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') setFocusMode(customEvent.detail);
    };

    window.addEventListener('ios-focus-changed', handleFocusChange);
    return () => window.removeEventListener('ios-focus-changed', handleFocusChange);
  }, []);

  const updateFocusMode = (value: boolean) => {
    setFocusMode(value);
    localStorage.setItem('ios-focus-enabled', String(value));
    window.dispatchEvent(new CustomEvent('ios-focus-changed', { detail: value }));
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

  const calendarCells = useMemo(() => {
    const year = time.getFullYear();
    const month = time.getMonth();
    const first = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: first }, () => null),
      ...Array.from({ length: count }, (_, index) => index + 1),
    ];
  }, [time]);

  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        new Intl.DateTimeFormat(language, { weekday: 'short' })
          .format(new Date(2026, 7, 2 + index))
          .replace('.', '')
      ),
    [language]
  );

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
            <span>{updates.length}</span>
          </header>
          {updates.length > 0 ? (
            <div className="apple-notification-center__updates">
              {updates.map((update) => (
                <button
                  type="button"
                  key={update.key}
                  className="apple-notification-center__update"
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
            <strong>{time.toLocaleDateString(language, { month: 'long', year: 'numeric' })}</strong>
          </header>
          <div className="apple-notification-center__weekdays">
            {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>
          <div className="apple-notification-center__days">
            {calendarCells.map((day, index) =>
              day === null ? (
                <span key={`empty-${index}`} />
              ) : (
                <span key={day} className={day === time.getDate() ? 'is-today' : ''}>{day}</span>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
