import { useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/useApp';
import {
  ensureCalendarEvents,
  getCalendarEventsForDate,
  goToCalendarToday,
  moveCalendarMonth,
  selectCalendarDate,
  useCalendarCenter,
} from './calendarCenter';

function areSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CalendarApp() {
  const { language } = useApp();
  const locale = language ?? 'en';
  const { selectedDate, visibleMonth, events, loading, error } = useCalendarCenter();
  const currentYear = visibleMonth.getFullYear();
  const currentMonth = visibleMonth.getMonth();

  useEffect(() => {
    void ensureCalendarEvents(locale);
  }, [locale]);

  const days = useMemo(() => {
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, index) => {
      const date = new Date(currentYear, currentMonth, index + 1);
      return { date, events: getCalendarEventsForDate(date) };
    });
  }, [events, currentMonth, currentYear]);

  const weekStartsOnMonday = ['ru', 'fr', 'es'].includes(locale.split('-')[0].toLowerCase());
  const weekStart = weekStartsOnMonday ? 1 : 0;
  const monthLabel = new Date(currentYear, currentMonth, 1).toLocaleString(locale, { month: 'long' });
  const weekdayLabels = useMemo(
    () => Array.from({ length: 7 }, (_, index) =>
      new Date(2024, 0, 7 + ((weekStart + index) % 7)).toLocaleDateString(locale, { weekday: 'short' })
    ),
    [locale, weekStart]
  );
  const leadingBlankDays = (new Date(currentYear, currentMonth, 1).getDay() - weekStart + 7) % 7;
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  return (
    <div className="calendar-app flex flex-col h-full bg-white" data-calendar-center="true">
      <div className="calendar-app__toolbar flex items-center justify-between border-b border-gray-200 px-4 py-2 bg-[#ece9d8]">
        <button type="button" onClick={() => moveCalendarMonth(-1)} className="calendar-app__nav-button px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-white/60 rounded" aria-label="Previous month">‹</button>
        <div className="calendar-app__month text-base font-semibold capitalize">{monthLabel} {currentYear}</div>
        <button type="button" onClick={() => moveCalendarMonth(1)} className="calendar-app__nav-button px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-white/60 rounded" aria-label="Next month">›</button>
        <button type="button" onClick={goToCalendarToday} className="calendar-app__today-button px-2 py-1 text-xs font-semibold rounded" aria-label="Today">{locale.startsWith('ru') ? 'Сегодня' : 'Today'}</button>
      </div>

      {loading ? (
        <div className="calendar-app__loading flex flex-1 items-center justify-center text-sm text-gray-500">{locale.startsWith('ru') ? 'Загрузка календаря…' : 'Loading calendar…'}</div>
      ) : error ? (
        <div className="calendar-app__error flex flex-1 flex-col items-center justify-center gap-2 p-4 text-sm text-gray-500" role="status">
          <span>{locale.startsWith('ru') ? 'Не удалось загрузить события календаря.' : 'Calendar events could not be loaded.'}</span>
          <button type="button" onClick={() => void ensureCalendarEvents(locale)} className="calendar-app__retry-button rounded px-3 py-1">{locale.startsWith('ru') ? 'Повторить' : 'Retry'}</button>
        </div>
      ) : (
        <div className="calendar-app__content flex-1 overflow-auto p-3">
          <div className="calendar-app__weekdays grid grid-cols-7 gap-1 text-xs">
            {weekdayLabels.map((weekday, index) => <div key={`${weekday}-${index}`} className="calendar-app__weekday">{weekday}</div>)}
          </div>
          <div className="calendar-app__grid grid grid-cols-7 gap-1 text-xs">
            {Array.from({ length: leadingBlankDays }, (_, index) => <div key={`blank-${index}`} className="calendar-app__day calendar-app__day--blank" aria-hidden="true" />)}
            {days.map((day) => {
              const isToday = areSameDay(day.date, new Date());
              const isSelected = areSameDay(day.date, selectedDate);
              return (
                <button
                  type="button"
                  key={day.date.toISOString()}
                  onClick={() => selectCalendarDate(day.date)}
                  aria-pressed={isSelected}
                  className={`calendar-app__day min-h-[110px] border border-gray-200 p-2 rounded text-left ${isToday ? 'is-today bg-yellow-100 border-yellow-400' : 'bg-white'} ${isWeekend(day.date) ? 'is-weekend bg-blue-50/40' : ''} ${isSelected ? 'is-selected ring-2 ring-blue-500 ring-inset' : ''}`}
                >
                  <span className="calendar-app__day-number block text-sm font-bold mb-1">{day.date.getDate()}</span>
                  <span className="block space-y-2">
                    {day.events.map((event) => (
                      <span key={`${event.summary}-${event.startDate.toISOString()}`} className="block">
                        <span className="calendar-app__event block text-[11px] font-semibold bg-blue-900 text-white px-1 rounded mb-1">{event.summary}</span>
                        {event.location && <span className="calendar-app__event-location block text-[10px] text-gray-600 truncate">{event.location}</span>}
                      </span>
                    ))}
                    {day.events.length === 0 && <span className="calendar-app__empty block text-[10px] text-gray-400 italic">{isWeekend(day.date) ? (locale.startsWith('ru') ? 'Выходной' : 'Weekend') : (locale.startsWith('ru') ? 'Нет событий' : 'No events')}</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="calendar-app__selection-summary mt-3 border-t border-gray-200 pt-2 text-xs text-gray-500">
            {selectedDate.toLocaleDateString(locale, { dateStyle: 'full' })} · {getCalendarEventsForDate(selectedDate).length} {locale.startsWith('ru') ? 'событий' : 'events'}
          </div>
        </div>
      )}
    </div>
  );
}
