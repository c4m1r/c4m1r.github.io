import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useApp } from '../../contexts/useApp';
import type { CalendarEvent } from './icsParser';
import {
  NATIONAL_COUNTRIES, getHolidaysForDate, getHolidayTitle, isSelectedCountryWeekend,
  loadSelectedLabourCountries, saveSelectedLabourCountries,
  type CountryCode,
} from './nationalCalendars';
import flagRu from '../langs/flag-ru.svg';
import flagKz from '../langs/flag-kz.svg';
import flagBy from '../langs/flag-by.svg';
import flagCn from '../langs/flag-cn.svg';
import flagJp from '../langs/flag-jp.svg';
import flagKr from '../langs/flag-kr.svg';
import flagGb from '../langs/flag-en.webp';
import {
  deleteCalendarEvent,
  ensureCalendarEvents,
  getCalendarEventsForDate,
  getCalendarEventsForRange,
  goToCalendarToday,
  moveCalendarMonth,
  saveCalendarEvent,
  selectCalendarDate,
  useCalendarCenter,
} from './calendarCenter';

type CalendarView = 'month' | 'week' | 'day' | 'list';
const countryFlags: Record<CountryCode, string> = { RU: flagRu, KZ: flagKz, BY: flagBy, CN: flagCn, JP: flagJp, KR: flagKr, GB: flagGb };
function countryName(code: CountryCode, locale: string) {
  const language = locale.split('-')[0];
  const country = NATIONAL_COUNTRIES.find((item) => item.code === code)!;
  return country.names[language === 'fr' ? 'fr' : language === 'ru' ? 'ru' : 'en'];
}

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
function isAllDayEvent(event: CalendarEvent) { return event.startDate.getHours() === 0 && event.startDate.getMinutes() === 0 && event.endDate.getHours() === 0 && event.endDate.getMinutes() === 0; }
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
  const [labourCountries, setLabourCountries] = useState<CountryCode[]>(() => loadSelectedLabourCountries());
  const toggleLabourCountry = (code: CountryCode) => {
    setLabourCountries((current) => {
      const next = current.includes(code) ? current.filter((item) => item !== code) : [...current, code];
      saveSelectedLabourCountries(next);
      return next;
    });
  };
  const renderHoliday = (holiday: ReturnType<typeof getHolidaysForDate>[number]) => {
    const country = NATIONAL_COUNTRIES.find((item) => item.code === holiday.country)!;
    return <div key={holiday.id} className={`calendar-app__holiday calendar-app__holiday--${holiday.kind}`} title={`${countryName(holiday.country, locale)} · ${holiday.title}`}>
      <img src={countryFlags[holiday.country]} alt={country.flag} />
      <strong>{getHolidayTitle(holiday, locale)}</strong>
    </div>;
  };

  useEffect(() => { void ensureCalendarEvents(locale); }, [locale]);

  const monday = ['ru', 'fr', 'es'].includes(locale.split('-')[0].toLowerCase());
  const weekStart = startOfWeek(selectedDate, monday);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const monthDays = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const start = startOfWeek(first, monday);
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [visibleMonth, monday]);
  const monthEvents = useMemo(() => getCalendarEventsForRange(
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1),
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0)
  ), [events, visibleMonth]);
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
      <span>{isAllDayEvent(event) ? (isRu ? 'Весь день' : 'All day') : event.startDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
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

      <div className="calendar-app__labour-country-picker" aria-label={isRu ? 'Трудовые календари стран' : 'Country labour calendars'}>
        <span>{isRu ? 'Выходные:' : locale.startsWith('fr') ? 'Week-ends :' : 'Weekends:'}</span>
        {NATIONAL_COUNTRIES.map((country) => (
          <button type="button" key={country.code} onClick={() => toggleLabourCountry(country.code)}
            aria-pressed={labourCountries.includes(country.code)}
            title={countryName(country.code, locale)}
            className={labourCountries.includes(country.code) ? 'is-active' : ''}>
            <img src={countryFlags[country.code]} alt={country.flag} />
            <span>{countryName(country.code, locale)}</span>
          </button>
        ))}
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
                  const holidays = getHolidaysForDate(date);
                  const weekend = isSelectedCountryWeekend(date, labourCountries);
                  const inMonth = date.getMonth() === visibleMonth.getMonth();
                  return <div key={date.toISOString()} className={`calendar-app__month-cell ${!inMonth ? 'is-outside' : ''} ${sameDay(date, selectedDate) ? 'is-selected' : ''} ${sameDay(date, new Date()) ? 'is-today' : ''} ${weekend ? 'is-labour-weekend' : ''}`}>
                    <button type="button" className="calendar-app__date-button" onClick={() => selectCalendarDate(date)} aria-pressed={sameDay(date, selectedDate)}>{date.getDate()}</button>
                    <div className="calendar-app__cell-events">
                      {holidays.slice(0, 2).map(renderHoliday)}
                      {dayEvents.slice(0, Math.max(0, 3 - holidays.length)).map(renderEvent)}
                      {dayEvents.length + holidays.length > 3 && <button type="button" className="calendar-app__more-events" onClick={() => { selectCalendarDate(date); setView('day'); }}>+{dayEvents.length + holidays.length - 3}</button>}
                      {weekend && <small className="calendar-app__weekend-label">{isRu ? 'Выходной' : locale.startsWith('fr') ? 'Repos' : 'Day off'}</small>}
                    </div>
                  </div>;
                })}
              </div>
            </>
          )}
          {view === 'week' && (
            <div className="calendar-app__week-grid grid min-h-0 flex-1 grid-cols-7 gap-1">
              {weekDays.map((date) => <section key={date.toISOString()} className={`calendar-app__week-column ${sameDay(date, selectedDate) ? 'is-selected' : ''}`}>
                <button type="button" onClick={() => selectCalendarDate(date)} className="calendar-app__week-date">{date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })}</button>
                {getHolidaysForDate(date).map(renderHoliday)}
                {getCalendarEventsForDate(date).map(renderEvent)}
                {isSelectedCountryWeekend(date, labourCountries) && <small className="calendar-app__weekend-label">{isRu ? 'Выходной' : 'Day off'}</small>}
                <button type="button" className="calendar-app__quick-add" onClick={() => openNewEvent(date)}>{isRu ? '+ Добавить' : '+ Add'}</button>
              </section>)}
            </div>
          )}
          {view === 'day' && (
            <section className="calendar-app__day-view">
              <h3>{selectedDate.toLocaleDateString(locale, { dateStyle: 'full' })}</h3>
              {getHolidaysForDate(selectedDate).map(renderHoliday)}
              {isSelectedCountryWeekend(selectedDate, labourCountries) && <small className="calendar-app__weekend-label">{isRu ? 'Выходной' : 'Day off'}</small>}
              {getCalendarEventsForDate(selectedDate).map(renderEvent)}
              {getCalendarEventsForDate(selectedDate).length === 0 && getHolidaysForDate(selectedDate).length === 0 && <p>{isRu ? 'На этот день событий нет.' : 'No events for this day.'}</p>}
              <button type="button" className="calendar-app__quick-add" onClick={() => openNewEvent(selectedDate)}>{isRu ? '+ Добавить событие' : '+ Add event'}</button>
            </section>
          )}
          {view === 'list' && (
            <div className="calendar-app__list-view">
              {monthEvents.length === 0 && Array.from({ length: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate() }, (_, index) => getHolidaysForDate(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1))).flat().length === 0 && <p>{isRu ? 'В этом месяце событий нет.' : 'No events this month.'}</p>}
              {monthEvents.map((event) => <div key={event.id ?? event.startDate.toISOString()} className="calendar-app__list-row">
                <button type="button" className="calendar-app__list-date" onClick={() => selectCalendarDate(event.startDate)}>{event.startDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</button>
                {renderEvent(event)}
              </div>)}
              {Array.from({ length: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate() }, (_, index) =>
                getHolidaysForDate(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1))
              ).flat().map((holiday) => (
                <div key={holiday.id} className="calendar-app__list-row">
                  <button type="button" className="calendar-app__list-date" onClick={() => selectCalendarDate(holiday.date)}>{holiday.date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</button>
                  {renderHoliday(holiday)}
                </div>
              ))}
            </div>
          )}
          <div className="calendar-app__selection-summary mt-2 border-t border-gray-200 pt-2 text-xs">
            {selectedDate.toLocaleDateString(locale, { dateStyle: 'full' })} · {getCalendarEventsForDate(selectedDate).length + getHolidaysForDate(selectedDate).length} {isRu ? 'событий' : 'events'}
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
