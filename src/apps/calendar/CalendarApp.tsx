import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useApp } from '../../contexts/useApp';
import type { CalendarEvent, CalendarRecurrenceRule } from './icsParser';
import {
  NATIONAL_COUNTRIES, getHolidaysForDate, getHolidayTitle, isSelectedCountryWeekend, isMakeupWorkday,
  setSelectedLabourCountries, useLabourCountries,
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
  getCalendarEventMaster,
  getCalendarEventsForRange,
  goToCalendarToday,
  moveCalendarMonth,
  saveCalendarEvent,
  selectCalendarDate,
  useCalendarCenter,
} from './calendarCenter';

type CalendarView = 'month' | 'week' | 'day' | 'list';
const countryFlags: Record<CountryCode, string> = { RU: flagRu, KZ: flagKz, BY: flagBy, CN: flagCn, JP: flagJp, KR: flagKr, GB: flagGb };
function dayOffLabel(locale: string) {
  const labels: Record<string, string> = { ru: 'Выходной', en: 'Day off', fr: 'Jour de repos', es: 'Día libre', zh: '休息日', ja: '休日', ko: '휴일' };
  return labels[locale.split('-')[0]] ?? labels.en;
}
const calendarUiLabels = {
  allDay: { ru: 'Весь день', en: 'All day', fr: 'Toute la journée', es: 'Todo el día', zh: '全天', ja: '終日', ko: '종일' },
  starts: { ru: 'Начало', en: 'Starts', fr: 'Début', es: 'Inicio', zh: '开始', ja: '開始', ko: '시작' },
  ends: { ru: 'Окончание', en: 'Ends', fr: 'Fin', es: 'Fin', zh: '结束', ja: '終了', ko: '종료' },
  repeat: { ru: 'Повторение', en: 'Repeat', fr: 'Répéter', es: 'Repetir', zh: '重复', ja: '繰り返し', ko: '반복' },
  frequency: { ru: 'Период', en: 'Frequency', fr: 'Fréquence', es: 'Frecuencia', zh: '频率', ja: '頻度', ko: '빈도' },
  noRepeat: { ru: 'Не повторять', en: 'Does not repeat', fr: 'Ne pas répéter', es: 'No repetir', zh: '不重复', ja: '繰り返さない', ko: '반복 안 함' },
  daily: { ru: 'Ежедневно', en: 'Daily', fr: 'Tous les jours', es: 'Cada día', zh: '每天', ja: '毎日', ko: '매일' },
  weekly: { ru: 'Еженедельно', en: 'Weekly', fr: 'Chaque semaine', es: 'Cada semana', zh: '每周', ja: '毎週', ko: '매주' },
  monthly: { ru: 'Ежемесячно', en: 'Monthly', fr: 'Chaque mois', es: 'Cada mes', zh: '每月', ja: '毎月', ko: '매월' },
  yearly: { ru: 'Ежегодно', en: 'Yearly', fr: 'Chaque année', es: 'Cada año', zh: '每年', ja: '毎年', ko: '매년' },
  interval: { ru: 'Каждые N периодов', en: 'Every N intervals', fr: 'Tous les N intervalles', es: 'Cada N intervalos', zh: '每隔 N 个周期', ja: 'N 間隔ごと', ko: 'N 간격마다' },
  occurrences: { ru: 'Количество повторов (необязательно)', en: 'Occurrences (optional)', fr: 'Nombre de répétitions (facultatif)', es: 'Número de repeticiones (opcional)', zh: '重复次数（可选）', ja: '繰り返し回数（任意）', ko: '반복 횟수(선택)' },
  unlimited: { ru: 'Без ограничения', en: 'Unlimited', fr: 'Illimité', es: 'Ilimitado', zh: '不限', ja: '無制限', ko: '무제한' },
  repeatUntil: { ru: 'Повторять до даты', en: 'Repeat until', fr: 'Répéter jusqu’au', es: 'Repetir hasta', zh: '重复至', ja: '終了日', ko: '종료 날짜' },
  importedCalendars: { ru: 'Импортированные календари', en: 'Imported calendars', fr: 'Calendriers importés', es: 'Calendarios importados', zh: '导入的日历', ja: 'インポートしたカレンダー', ko: '가져온 캘린더' },
  myEvents: { ru: 'Мои события', en: 'My events', fr: 'Mes événements', es: 'Mis eventos', zh: '我的事件', ja: '自分の予定', ko: '내 일정' },
  icsColor: { ru: 'Цвет ICS', en: 'ICS color', fr: 'Couleur ICS', es: 'Color ICS', zh: 'ICS 颜色', ja: 'ICS の色', ko: 'ICS 색상' },
  myEventsColor: { ru: 'Цвет моих событий', en: 'My events color', fr: 'Couleur de mes événements', es: 'Color de mis eventos', zh: '我的事件颜色', ja: '自分の予定の色', ko: '내 일정 색상' },
  blue: { ru: 'Синий', en: 'Blue', fr: 'Bleu', es: 'Azul', zh: '蓝色', ja: '青', ko: '파랑' },
  purple: { ru: 'Фиолетовый', en: 'Purple', fr: 'Violet', es: 'Morado', zh: '紫色', ja: '紫', ko: '보라' },
  orange: { ru: 'Оранжевый', en: 'Orange', fr: 'Orange', es: 'Naranja', zh: '橙色', ja: 'オレンジ', ko: '주황' },
  teal: { ru: 'Бирюзовый', en: 'Teal', fr: 'Bleu sarcelle', es: 'Verde azulado', zh: '青绿色', ja: '青緑', ko: '청록' },
  green: { ru: 'Зелёный', en: 'Green', fr: 'Vert', es: 'Verde', zh: '绿色', ja: '緑', ko: '초록' },
  title: { ru: 'Название', en: 'Title', fr: 'Titre', es: 'Título', zh: '标题', ja: 'タイトル', ko: '제목' },
  location: { ru: 'Место', en: 'Location', fr: 'Lieu', es: 'Lugar', zh: '地点', ja: '場所', ko: '장소' },
  description: { ru: 'Описание', en: 'Description', fr: 'Description', es: 'Descripción', zh: '描述', ja: '説明', ko: '설명' },
  save: { ru: 'Сохранить', en: 'Save', fr: 'Enregistrer', es: 'Guardar', zh: '保存', ja: '保存', ko: '저장' },
  cancel: { ru: 'Отмена', en: 'Cancel', fr: 'Annuler', es: 'Cancelar', zh: '取消', ja: 'キャンセル', ko: '취소' },
  delete: { ru: 'Удалить', en: 'Delete', fr: 'Supprimer', es: 'Eliminar', zh: '删除', ja: '削除', ko: '삭제' },
  edit: { ru: 'Изменить', en: 'Edit', fr: 'Modifier', es: 'Editar', zh: '编辑', ja: '編集', ko: '수정' },
  newEvent: { ru: 'Новое событие', en: 'New event', fr: 'Nouvel événement', es: 'Nuevo evento', zh: '新建事件', ja: '新しい予定', ko: '새 일정' },
  editEvent: { ru: 'Изменить событие', en: 'Edit event', fr: 'Modifier l’événement', es: 'Editar evento', zh: '编辑事件', ja: '予定を編集', ko: '일정 수정' },
} as const;
function calendarUiText(locale: string, key: keyof typeof calendarUiLabels) {
  const language = locale.split('-')[0] as keyof typeof calendarUiLabels[typeof key];
  return calendarUiLabels[key][language] ?? calendarUiLabels[key].en;
}
function countryName(code: CountryCode, locale: string) {
  const language = locale.split('-')[0];
  const country = NATIONAL_COUNTRIES.find((item) => item.code === code)!;
  return country.names[(language in country.names ? language : 'en') as keyof typeof country.names];
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
function toLocalDateInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function fromLocalDateInput(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
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
  const [allDay, setAllDay] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState<'NONE' | CalendarRecurrenceRule['freq']>('NONE');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceCount, setRecurrenceCount] = useState('');
  const [recurrenceUntil, setRecurrenceUntil] = useState('');
  const [showImportedEvents, setShowImportedEvents] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('calendar-center-source-preferences-v1') || '{}').showImportedEvents ?? true; } catch { return true; }
  });
  const [showLocalEvents, setShowLocalEvents] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('calendar-center-source-preferences-v1') || '{}').showLocalEvents ?? true; } catch { return true; }
  });
  const [importedEventColor, setImportedEventColor] = useState(() => {
    try { return JSON.parse(localStorage.getItem('calendar-center-source-preferences-v1') || '{}').importedEventColor ?? 'blue'; } catch { return 'blue'; }
  });
  const [localEventColor, setLocalEventColor] = useState(() => {
    try { return JSON.parse(localStorage.getItem('calendar-center-source-preferences-v1') || '{}').localEventColor ?? 'green'; } catch { return 'green'; }
  });
  const labourCountries = useLabourCountries();
  useEffect(() => {
    try {
      localStorage.setItem('calendar-center-source-preferences-v1', JSON.stringify({
        showImportedEvents, showLocalEvents, importedEventColor, localEventColor,
      }));
    } catch { /* Keep display preferences in session state. */ }
  }, [showImportedEvents, showLocalEvents, importedEventColor, localEventColor]);

  const toggleLabourCountry = (code: CountryCode) => {
    const next = labourCountries.includes(code) ? labourCountries.filter((item) => item !== code) : [...labourCountries, code];
    setSelectedLabourCountries(next);
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
  const getVisibleEventsForDate = (date: Date) => getCalendarEventsForDate(date).filter((event) => event.source === 'local' ? showLocalEvents : showImportedEvents);
  const monthEvents = useMemo(() => getCalendarEventsForRange(
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1),
    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0)
  ).filter((event) => event.source === 'local' ? showLocalEvents : showImportedEvents), [events, visibleMonth, showImportedEvents, showLocalEvents]);
  const monthHolidays = useMemo(() => Array.from(
    { length: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate() },
    (_, index) => getHolidaysForDate(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1))
  ).flat(), [visibleMonth]);
  const getMonthEventsForDate = (date: Date) => {
    const target = dayStart(date).getTime();
    const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
    return monthEvents.filter((event) => {
      const isAllDay = event.startDate.getHours() === 0 && event.startDate.getMinutes() === 0 &&
        event.endDate.getHours() === 0 && event.endDate.getMinutes() === 0;
      const allDayLocalInclusive = event.source === 'local' && isAllDay;
      const startsBeforeNextDay = event.startDate.getTime() < nextDay;
      const endsAfterStart = allDayLocalInclusive ? dayStart(event.endDate).getTime() >= target : event.endDate.getTime() > target;
      return startsBeforeNextDay && endsAfterStart;
    });
  };
  const listEntries = useMemo(() => [
    ...monthEvents.map((event) => ({ type: 'event' as const, date: event.startDate, event })),
    ...monthHolidays.map((holiday) => ({ type: 'holiday' as const, date: holiday.date, holiday })),
    ...Array.from({ length: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate() }, (_, index) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1))
      .flatMap((date) => [
        ...(isSelectedCountryWeekend(date, labourCountries) ? [{ type: 'dayoff' as const, date }] : []),
        ...(isMakeupWorkday(date, labourCountries) ? [{ type: 'makeup' as const, date }] : []),
      ]),
  ].sort((a, b) => a.date.getTime() - b.date.getTime()), [monthEvents, monthHolidays, visibleMonth, labourCountries]);
  const monthLabel = visibleMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const weekdayLabels = useMemo(() => Array.from({ length: 7 }, (_, index) =>
    addDays(startOfWeek(new Date(2024, 0, 7), monday), index).toLocaleDateString(locale, { weekday: 'short' })
  ), [locale, monday]);

  const openNewEvent = (date = selectedDate) => {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setActiveEvent(null);
    setTitle(''); setLocation(''); setDescription('');
    setAllDay(false); setRecurrenceFreq('NONE'); setRecurrenceInterval(1); setRecurrenceCount(''); setRecurrenceUntil('');
    setStartValue(toLocalInput(start)); setEndValue(toLocalInput(end));
    setFormError(''); setEditorOpen(true);
  };
  const openEditEvent = (event: CalendarEvent) => {
    if (event.source !== 'local') { setActiveEvent(event); return; }
    const seriesEvent = getCalendarEventMaster(event);
    setActiveEvent(seriesEvent); setTitle(seriesEvent.summary); setLocation(seriesEvent.location ?? '');
    setDescription(seriesEvent.description ?? '');
    const eventIsAllDay = isAllDayEvent(seriesEvent);
    setAllDay(eventIsAllDay);
    setStartValue(eventIsAllDay ? toLocalDateInput(seriesEvent.startDate) : toLocalInput(seriesEvent.startDate));
    setEndValue(eventIsAllDay ? toLocalDateInput(seriesEvent.endDate) : toLocalInput(seriesEvent.endDate));
    setRecurrenceFreq(seriesEvent.recurrenceRule?.freq ?? 'NONE');
    setRecurrenceInterval(seriesEvent.recurrenceRule?.interval ?? 1);
    setRecurrenceCount(seriesEvent.recurrenceRule?.count ? String(seriesEvent.recurrenceRule.count) : '');
    setRecurrenceUntil(seriesEvent.recurrenceRule?.until ? toLocalDateInput(seriesEvent.recurrenceRule.until) : '');
    setFormError(''); setEditorOpen(true);
  };
  const submitEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const recurrenceRule: CalendarRecurrenceRule | undefined = recurrenceFreq === 'NONE' ? undefined : {
        freq: recurrenceFreq,
        interval: Math.max(1, Math.min(365, Math.floor(recurrenceInterval) || 1)),
        count: recurrenceCount.trim() ? Math.max(1, Math.min(10000, Math.floor(Number(recurrenceCount)))) : undefined,
        until: !recurrenceCount.trim() && recurrenceUntil ? (() => { const date = fromLocalDateInput(recurrenceUntil); date.setHours(23, 59, 59, 999); return date; })() : undefined,
      };
      const saved = saveCalendarEvent({
        summary: title, location, description,
        startDate: allDay ? fromLocalDateInput(startValue) : fromLocalInput(startValue),
        endDate: allDay ? fromLocalDateInput(endValue) : fromLocalInput(endValue),
        recurrenceRule,
      }, activeEvent?.source === 'local' ? (activeEvent.recurrenceMasterId ?? activeEvent.id) : undefined);
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
    <button type="button" key={event.id ?? `${event.summary}-${event.startDate.toISOString()}`} className={`calendar-app__event-chip ${event.source === 'local' ? 'is-local' : 'is-readonly'}`} data-calendar-color={event.source === 'local' ? localEventColor : importedEventColor} onClick={() => openEditEvent(event)} title={event.location || event.summary}>
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
        <span>{({ ru: 'Выходные:', en: 'Weekends:', fr: 'Week-ends :', es: 'Fines de semana:', zh: '周末：', ja: '週末：', ko: '주말:' } as Record<string, string>)[locale.split('-')[0]] ?? 'Weekends:'}</span>
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
      <div className="calendar-app__source-controls">
        <label><input type="checkbox" checked={showImportedEvents} onChange={(event) => setShowImportedEvents(event.target.checked)} />{calendarUiText(locale, 'importedCalendars')}</label>
        <label><input type="checkbox" checked={showLocalEvents} onChange={(event) => setShowLocalEvents(event.target.checked)} />{calendarUiText(locale, 'myEvents')}</label>
        <label>{calendarUiText(locale, 'icsColor')}<select value={importedEventColor} onChange={(event) => setImportedEventColor(event.target.value)}>
          <option value="blue">{calendarUiText(locale, 'blue')}</option><option value="purple">{calendarUiText(locale, 'purple')}</option><option value="orange">{calendarUiText(locale, 'orange')}</option><option value="teal">{calendarUiText(locale, 'teal')}</option>
        </select></label>
        <label>{calendarUiText(locale, 'myEventsColor')}<select value={localEventColor} onChange={(event) => setLocalEventColor(event.target.value)}>
          <option value="green">{calendarUiText(locale, 'green')}</option><option value="blue">{isRu ? 'Синий' : 'Blue'}</option><option value="purple">{isRu ? 'Фиолетовый' : 'Purple'}</option><option value="orange">{isRu ? 'Оранжевый' : 'Orange'}</option>
        </select></label>
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
                  const dayEvents = getMonthEventsForDate(date);
                  const holidays = getHolidaysForDate(date);
                  const weekend = isSelectedCountryWeekend(date, labourCountries);
                  const makeupWorkday = isMakeupWorkday(date, labourCountries);
                  const inMonth = date.getMonth() === visibleMonth.getMonth();
                  return <div key={date.toISOString()} className={`calendar-app__month-cell ${!inMonth ? 'is-outside' : ''} ${sameDay(date, selectedDate) ? 'is-selected' : ''} ${sameDay(date, new Date()) ? 'is-today' : ''} ${weekend ? 'is-labour-weekend' : ''} ${makeupWorkday ? 'is-makeup-workday' : ''}`}>
                    <button type="button" className="calendar-app__date-button" onClick={() => selectCalendarDate(date)} aria-pressed={sameDay(date, selectedDate)}>{date.getDate()}</button>
                    <div className="calendar-app__cell-events">
                      {holidays.slice(0, 2).map(renderHoliday)}
                      {dayEvents.slice(0, Math.max(0, 3 - holidays.length)).map(renderEvent)}
                      {dayEvents.length + holidays.length > 3 && <button type="button" className="calendar-app__more-events" onClick={() => { selectCalendarDate(date); setView('day'); }}>+{dayEvents.length + holidays.length - 3}</button>}
                      {weekend && <small className="calendar-app__weekend-label">{dayOffLabel(locale)}</small>}{makeupWorkday && <small className="calendar-app__makeup-work-label">{locale.startsWith('ru') ? 'Рабочий день' : 'Working day'}</small>}
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
                {getVisibleEventsForDate(date).map(renderEvent)}
                {isSelectedCountryWeekend(date, labourCountries) && <small className="calendar-app__weekend-label">{dayOffLabel(locale)}</small>}{isMakeupWorkday(date, labourCountries) && <small className="calendar-app__makeup-work-label">{locale.startsWith('ru') ? 'Рабочий день' : 'Working day'}</small>}
                <button type="button" className="calendar-app__quick-add" onClick={() => openNewEvent(date)}>{isRu ? '+ Добавить' : '+ Add'}</button>
              </section>)}
            </div>
          )}
          {view === 'day' && (
            <section className="calendar-app__day-view">
              <h3>{selectedDate.toLocaleDateString(locale, { dateStyle: 'full' })}</h3>
              {getHolidaysForDate(selectedDate).map(renderHoliday)}
              {isSelectedCountryWeekend(selectedDate, labourCountries) && <small className="calendar-app__weekend-label">{dayOffLabel(locale)}</small>}{isMakeupWorkday(selectedDate, labourCountries) && <small className="calendar-app__makeup-work-label">{locale.startsWith('ru') ? 'Рабочий день' : 'Working day'}</small>}
              {getVisibleEventsForDate(selectedDate).map(renderEvent)}
              {getVisibleEventsForDate(selectedDate).length === 0 && getHolidaysForDate(selectedDate).length === 0 && !isSelectedCountryWeekend(selectedDate, labourCountries) && !isMakeupWorkday(selectedDate, labourCountries) && <p>{isRu ? 'На этот день событий нет.' : 'No events for this day.'}</p>}
              <button type="button" className="calendar-app__quick-add" onClick={() => openNewEvent(selectedDate)}>{isRu ? '+ Добавить событие' : '+ Add event'}</button>
            </section>
          )}
          {view === 'list' && (
            <div className="calendar-app__list-view">
              {listEntries.length === 0 && <p>{isRu ? 'В этом месяце событий нет.' : 'No events this month.'}</p>}
              {listEntries.map((entry) => entry.type === 'event' ? (
                <div key={entry.event.id ?? entry.event.startDate.toISOString()} className="calendar-app__list-row">
                  <button type="button" className="calendar-app__list-date" onClick={() => selectCalendarDate(entry.event.startDate)}>{entry.event.startDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</button>
                  {renderEvent(entry.event)}
                </div>
              ) : entry.type === 'holiday' ? (
                <div key={entry.holiday.id} className="calendar-app__list-row">
                  <button type="button" className="calendar-app__list-date" onClick={() => selectCalendarDate(entry.holiday.date)}>{entry.holiday.date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</button>
                  {renderHoliday(entry.holiday)}
                </div>
              ) : (
                <div key={entry.type + '-' + toLocalDateInput(entry.date)} className="calendar-app__list-row">
                  <button type="button" className="calendar-app__list-date" onClick={() => selectCalendarDate(entry.date)}>{entry.date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</button>
                  <small className={entry.type === 'dayoff' ? 'calendar-app__weekend-label' : 'calendar-app__makeup-work-label'}>{entry.type === 'dayoff' ? dayOffLabel(locale) : (locale.startsWith('ru') ? 'Рабочий день' : 'Working day')}</small>
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
          {activeEvent.source === 'local' && <div className="flex gap-2"><button type="button" onClick={() => openEditEvent(activeEvent)}>{calendarUiText(locale, 'edit')}</button><button type="button" onClick={() => { if (activeEvent.id) deleteCalendarEvent(activeEvent.recurrenceMasterId ?? activeEvent.id); setActiveEvent(null); }}>{calendarUiText(locale, 'delete')}</button></div>}
          {activeEvent.source !== 'local' && <small>{isRu ? 'Событие из календаря (только чтение)' : 'Imported calendar event (read-only)'}</small>}
        </aside>
      )}

      {editorOpen && (
        <div className="calendar-app__editor-backdrop" role="presentation">
          <form className="calendar-app__editor" onSubmit={submitEvent}>
            <header><strong>{activeEvent ? (isRu ? 'Изменить событие' : 'Edit event') : (isRu ? 'Новое событие' : 'New event')}</strong><button type="button" onClick={() => setEditorOpen(false)} aria-label={isRu ? 'Закрыть' : 'Close'}>×</button></header>
            <label>{calendarUiText(locale, 'title')}<input required value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} autoFocus /></label>
            <label>{calendarUiText(locale, 'location')}<input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={200} /></label>
            <label className="calendar-app__all-day-toggle"><input type="checkbox" checked={allDay} onChange={(event) => {
              const enabled = event.target.checked;
              setAllDay(enabled);
              if (enabled) {
                setStartValue((value) => toLocalDateInput(value.includes('T') ? fromLocalInput(value) : fromLocalDateInput(value)));
                setEndValue((value) => toLocalDateInput(value.includes('T') ? fromLocalInput(value) : fromLocalDateInput(value)));
              } else {
                setStartValue((value) => toLocalInput(fromLocalDateInput(value)));
                setEndValue((value) => toLocalInput(fromLocalDateInput(value)));
              }
            }} />{calendarUiText(locale, 'allDay')}</label>
            <label>{calendarUiText(locale, 'starts')}<input required type={allDay ? 'date' : 'datetime-local'} value={startValue} onChange={(event) => setStartValue(event.target.value)} /></label>
            <label>{calendarUiText(locale, 'ends')}<input required type={allDay ? 'date' : 'datetime-local'} value={endValue} onChange={(event) => setEndValue(event.target.value)} /></label>
            <fieldset className="calendar-app__recurrence-fields">
              <legend>{calendarUiText(locale, 'repeat')}</legend>
              <label>{calendarUiText(locale, 'frequency')}<select value={recurrenceFreq} onChange={(event) => setRecurrenceFreq(event.target.value as typeof recurrenceFreq)}>
                <option value="NONE">{calendarUiText(locale, 'noRepeat')}</option>
                <option value="DAILY">{calendarUiText(locale, 'daily')}</option>
                <option value="WEEKLY">{calendarUiText(locale, 'weekly')}</option>
                <option value="MONTHLY">{calendarUiText(locale, 'monthly')}</option>
                <option value="YEARLY">{calendarUiText(locale, 'yearly')}</option>
              </select></label>
              {recurrenceFreq !== 'NONE' && <>
                <label>{calendarUiText(locale, 'interval')}<input type="number" min="1" max="365" value={recurrenceInterval} onChange={(event) => setRecurrenceInterval(Number(event.target.value))} /></label>
                <label>{calendarUiText(locale, 'occurrences')}<input type="number" min="1" max="10000" value={recurrenceCount} onChange={(event) => setRecurrenceCount(event.target.value)} placeholder={calendarUiText(locale, 'unlimited')} /></label>
                {!recurrenceCount && <label>{calendarUiText(locale, 'repeatUntil')}<input type="date" value={recurrenceUntil} onChange={(event) => setRecurrenceUntil(event.target.value)} /></label>}
              </>}
            </fieldset>
            <label>{calendarUiText(locale, 'description')}<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={2000} /></label>
            {formError && <p role="alert">{formError}</p>}
            <footer><button type="button" onClick={() => setEditorOpen(false)}>{calendarUiText(locale, 'cancel')}</button><button type="submit">{calendarUiText(locale, 'save')}</button></footer>
          </form>
        </div>
      )}
    </div>
  );
}
