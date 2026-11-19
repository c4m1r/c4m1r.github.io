import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useApp } from '../../contexts/useApp';
import type { CalendarEvent } from './icsParser';
import {
  deleteCalendarEvent,
  ensureCalendarEvents,
  getCalendarEventsForDate,
  getCalendarEventsForRange,
  goToCalendarToday,
  moveCalendarMonth,
  saveCalendarEvent,
  selectCalendarDate,
  setCalendarVisibleMonth,
  useCalendarCenter,
} from './calendarCenter';

type CalendarView = 'month' | 'week' | 'day' | 'list';

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function dayStart(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function addDays(date: Date, amount: number) { const next = dayStart(date); next.setDate(next.getDate() + amount); return next; }
function startOfWeek(date: Date, monday: boolean) {
  const day = dayStart(date);
  day.setDate(day.getDate() - ((day.getDay() - (monday ? 1 : 0) + 7) % 7));
  return day;
}
function toLocalInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function fromLocalInput(value: string) {
  const [datePart, timePart = '00:00'] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes || 0);
}

export function CalendarApp() {
  const { language } = useApp();
  const locale = language ?? 'en';
  const isRu = locale.startsWith('ru');
  const { selectedDate, visibleMonth, events, loading, error } = useCalendarCenter();
  const [view, setView] = useState<CalendarView>('month');
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startValue, setStartValue] = useState('');
  const [endValue, setEndValue] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => { void ensureCalendarEvents(locale); }, [locale]);

  const monday = ['ru', 'fr', 'es'].includes(locale.split('-')[0].toLowerCase());
  const weekStart = startOfWeek(selectedDate, monday);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart.getTime()]);
  const monthDays = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const start = startOfWeek(first, monday);
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [visibleMonth.getFullYear(), visibleMonth.getMonth(), monday]);
  const monthEvents = useMemo(() => getCalendarEventsForRange(
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1),
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0)
  ), [events, visibleMonth.getFullYear(), visibleMonth.getMonth()]);
  const monthLabel = visibleMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const weekdayLabels = useMemo(() => Array.from({ length: 7 }, (_, index) =>
    addDays(startOfWeek(new Date(2024, 0, 7), monday), index).toLocaleDateString(locale, { weekday: 'short' })
  ), [locale, monday]);

  const openNewEvent = (date = selectedDate) => {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setActiveEvent(null);
    setTitle(''); setLocation(''); setDescription('');
    setStartValue(toLocalInput(start)); setEndValue(toLocalInput(end));
    setFormError(''); setEditorOpen(true);
  };
  const openEditEvent = (event: CalendarEvent) => {
    if (event.source !== 'local') { setActiveEvent(event); return; }
    setActiveEvent(event); setTitle(event.summary); setLocation(event.location ?? '');
    setDescription(event.description ?? ''); setStartValue(toLocalInput(event.startDate));
    setEndValue(toLocalInput(event.endDate)); setFormError(''); setEditorOpen(true);
  };
  const submitEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const saved = saveCalendarEvent({
        summary: title, location, description,
        startDate: fromLocalInput(startValue), endDate: fromLocalInput(endValue),
      }, activeEvent?.source === 'local' ? activeEvent.id : undefined);
      selectCalendarDate(saved.startDate);
      setActiveEvent(saved); setEditorOpen(false); setFormError('');
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : (isRu ? 'Не удалось сохранить событие' : 'Could not save event'));
    }
  };
  const navigate = (direction: number) => {
    if (view === 'day') selectCalendarDate(addDays(selectedDate, direction));
    else if (view === 'week') selectCalendarDate(addDays(selectedDate, direction * 7));
    else moveCalendarMonth(direction);
  };
  const rangeLabel = view === 'day'
    ? selectedDate.toLocaleDateString(locale, { dateStyle: 'full' })
    : view === 'week'
      ? `${weekDays[0].toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${weekDays[6].toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`
      : monthLabel;

  const renderEvent = (event: CalendarEvent) => (
    <button type="button" key={event.id ?? `${event.summary}-${event.startDate.toISOString()}`} className={`calendar-app__event-chip ${event.source === 'local' ? 'is-local' : 'is-readonly'}`} onClick={() => openEditEvent(event)} title={event.location || event.summary}>
      <span>{event.startDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
      <strong>{event.summary}</strong>
      {event.location && <small>{event.location}</small>}
    </button>
  );

  return (
    <div className="calendar-app flex h-full min-h-0 flex-col bg-white" data-calendar-center="true">
      <div className="calendar-app__toolbar flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-3 py-2 bg-[#ece9d8]">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => navigate(-1)} className="calendar-app__nav-button" aria-label={isRu ? 'Назад' : 'Previous'}>‹</button>
          <button type="button" onClick={() => navigate(1)} className="calendar-app__nav-button" aria-label={isRu ? 'Вперёд' : 'Next'}>›</button>
          <button type="button" onClick={goToCalendarToday} className="calendar-app__today-button">{isRu ? 'Сегодня' : 'Today'}</button>
        </div>
        <div className="calendar-app__month text-base font-semibold capitalize">{rangeLabel}</div>
        <div className="flex items-center gap-2">
          <div className="calendar-app__view-switch" role="group" aria-label={isRu ? 'Вид календаря' : 'Calendar view'}>
            {(['month', 'week', 'day', 'list'] as CalendarView[]).map((item) => (
              <button type="button" key={item} onClick={() => setView(item)} aria-pressed={view === item}>{({ month: isRu ? 'Месяц' : 'Month', week: isRu ? 'Неделя' : 'Week', day: isRu ? 'День' : 'Day', list: isRu ? 'Список' : 'List' })[item]}</button>
            ))}
          </div>
          <button type="button" className="calendar-app__add-button" onClick={() => openNewEvent()}>{isRu ? '+ Событие' : '+ Event'}</button>
        </div>
      </div>

      {loading ? (
        <div className="calendar-app__loading flex flex-1 items-center justify-center">{isRu ? 'Загрузка календаря…' : 'Loading calendar…'}</div>
      ) : error ? (
        <div className="calendar-app__error flex flex-1 flex-col items-center justify-center gap-2 p-4" role="status">
          <span>{isRu ? 'Не удалось загрузить события календаря.' : 'Calendar events could not be loaded.'}</span>
          <button type="button" onClick={() => void ensureCalendarEvents(locale)} className="calendar-app__retry-button">{isRu ? 'Повторить' : 'Retry'}</button>
        </div>
      ) : (
        <div className="calendar-app__content flex min-h-0 flex-1 flex-col overflow-auto p-3">
          {view === 'month' && (
            <>
              <div className="calendar-app__weekdays grid grid-cols-7 gap-1 text-xs">{weekdayLabels.map((label, index) => <div key={index}>{label}</div>)}</div>
              <div className="calendar-app__month-grid grid min-h-0 flex-1 grid-cols-7 gap-1">
                {monthDays.map((date) => {
                  const dayEvents = getCalendarEventsForDate(date);
                  const inMonth = date.getMonth() === visibleMonth.getMonth();
                  return <div key={date.toISOString()} className={`calendar-app__month-cell ${!inMonth ? 'is-outside' : ''} ${sameDay(date, selectedDate) ? 'is-selected' : ''} ${sameDay(date, new Date()) ? 'is-today' : ''}`}>
                    <button type="button" className="calendar-app__date-button" onClick={() => selectCalendarDate(date)} aria-pressed={sameDay(date, selectedDate)}>{date.getDate()}</button>
                    <div className="calendar-app__cell-events">{dayEvents.slice(0, 3).map(renderEvent)}{dayEvents.length > 3 && <button type="button" className="calendar-app__more-events" onClick={() => { selectCalendarDate(date); setView('day'); }}>+{dayEvents.length - 3}</button>}</div>
                  </div>;
                })}
              </div>
            </>
          )}
          {view === 'week' && (
            <div className="calendar-app__week-grid grid min-h-0 flex-1 grid-cols-7 gap-1">
              {weekDays.map((date) => <section key={date.toISOString()} className={`calendar-app__week-column ${sameDay(date, selectedDate) ? 'is-selected' : ''}`}>
                <button type="button" onClick={() => selectCalendarDate(date)} className="calendar-app__week-date">{date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })}</button>
                {getCalendarEventsForDate(date).map(renderEvent)}
                <button type="button" className="calendar-app__quick-add" onClick={() => openNewEvent(date)}>{isRu ? '+ Добавить' : '+ Add'}</button>
              </section>)}
            </div>
          )}
          {view === 'day' && (
            <section className="calendar-app__day-view">
              <h3>{selectedDate.toLocaleDateString(locale, { dateStyle: 'full' })}</h3>
              {getCalendarEventsForDate(selectedDate).map(renderEvent)}
              {getCalendarEventsForDate(selectedDate).length === 0 && <p>{isRu ? 'На этот день событий нет.' : 'No events for this day.'}</p>}
              <button type="button" className="calendar-app__quick-add" onClick={() => openNewEvent(selectedDate)}>{isRu ? '+ Добавить событие' : '+ Add event'}</button>
            </section>
          )}
          {view === 'list' && (
            <div className="calendar-app__list-view">
              {monthEvents.length === 0 && <p>{isRu ? 'В этом месяце событий нет.' : 'No events this month.'}</p>}
              {monthEvents.map((event) => <div key={event.id ?? event.startDate.toISOString()} className="calendar-app__list-row">
                <button type="button" className="calendar-app__list-date" onClick={() => selectCalendarDate(event.startDate)}>{event.startDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</button>
                {renderEvent(event)}
              </div>)}
            </div>
          )}
          <div className="calendar-app__selection-summary mt-2 border-t border-gray-200 pt-2 text-xs">
            {selectedDate.toLocaleDateString(locale, { dateStyle: 'full' })} · {getCalendarEventsForDate(selectedDate).length} {isRu ? 'событий' : 'events'}
          </div>
        </div>
      )}

      {activeEvent && !editorOpen && (
        <aside className="calendar-app__event-details" aria-live="polite">
          <button type="button" className="calendar-app__close" onClick={() => setActiveEvent(null)} aria-label={isRu ? 'Закрыть' : 'Close'}>×</button>
          <strong>{activeEvent.summary}</strong>
          <span>{activeEvent.startDate.toLocaleString(locale)} – {activeEvent.endDate.toLocaleString(locale)}</span>
          {activeEvent.location && <span>{activeEvent.location}</span>}
          {activeEvent.description && <p>{activeEvent.description}</p>}
          {activeEvent.source === 'local' && <div className="flex gap-2"><button type="button" onClick={() => openEditEvent(activeEvent)}>{isRu ? 'Изменить' : 'Edit'}</button><button type="button" onClick={() => { if (activeEvent.id) deleteCalendarEvent(activeEvent.id); setActiveEvent(null); }}>{isRu ? 'Удалить' : 'Delete'}</button></div>}
          {activeEvent.source !== 'local' && <small>{isRu ? 'Событие из календаря (только чтение)' : 'Imported calendar event (read-only)'}</small>}
        </aside>
      )}

      {editorOpen && (
        <div className="calendar-app__editor-backdrop" role="presentation">
          <form className="calendar-app__editor" onSubmit={submitEvent}>
            <header><strong>{activeEvent ? (isRu ? 'Изменить событие' : 'Edit event') : (isRu ? 'Новое событие' : 'New event')}</strong><button type="button" onClick={() => setEditorOpen(false)} aria-label={isRu ? 'Закрыть' : 'Close'}>×</button></header>
            <label>{isRu ? 'Название' : 'Title'}<input required value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} autoFocus /></label>
            <label>{isRu ? 'Место' : 'Location'}<input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={200} /></label>
            <label>{isRu ? 'Начало' : 'Starts'}<input required type="datetime-local" value={startValue} onChange={(event) => setStartValue(event.target.value)} /></label>
            <label>{isRu ? 'Окончание' : 'Ends'}<input required type="datetime-local" value={endValue} onChange={(event) => setEndValue(event.target.value)} /></label>
            <label>{isRu ? 'Описание' : 'Description'}<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={2000} /></label>
            {formError && <p role="alert">{formError}</p>}
            <footer><button type="button" onClick={() => setEditorOpen(false)}>{isRu ? 'Отмена' : 'Cancel'}</button><button type="submit">{isRu ? 'Сохранить' : 'Save'}</button></footer>
          </form>
        </div>
      )}
    </div>
  );
}
