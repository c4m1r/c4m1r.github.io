import { useMemo, useState } from 'react';
import { type Language } from '../../../i18n/translations';

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
  const [focusMode, setFocusMode] = useState(false);

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
            onClick={() => setFocusMode((value) => !value)}
            aria-pressed={focusMode}
          >
            {focusMode ? 'Focus On' : 'Focus'}
          </button>
        </section>

        <section className="apple-notification-center__notifications">
          <header>
            <strong>Notification Center</strong>
            <span>0</span>
          </header>
          <div className="apple-notification-center__empty">
            <span aria-hidden="true">◌</span>
            <strong>No Notifications</strong>
            <small>New notifications will appear here.</small>
          </div>
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
