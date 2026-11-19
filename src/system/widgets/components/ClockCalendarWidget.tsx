import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../contexts/useApp';
import {
  ensureCalendarEvents,
  getCalendarEventsForDate,
  moveCalendarMonth,
  selectCalendarDate,
  useCalendarCenter,
} from '../../../apps/calendar/calendarCenter';
import { getHolidaysForDate, getHolidayTitle, isSelectedCountryWeekend, isMakeupWorkday, NATIONAL_COUNTRIES, useLabourCountries } from '../../../apps/calendar/nationalCalendars';

export function ClockCalendarWidget({ onOpenCalendar }: { onOpenCalendar?: () => void }) {
  const { language } = useApp();
  const [now, setNow] = useState(new Date());
  const { visibleMonth, selectedDate } = useCalendarCenter();
  const labourCountries = useLabourCountries();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void ensureCalendarEvents(language);
  }, [language]);

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours() % 12;
  const secDeg = seconds * 6;
  const minDeg = minutes * 6 + seconds * 0.1;
  const hrDeg = hours * 30 + minutes * 0.5;

  const weekStartsOnMonday = language === 'ru' || language === 'fr' || language === 'es';
  const weekStart = weekStartsOnMonday ? 1 : 0;
  const monthDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() - weekStart + 7) % 7;
    const cells: Array<Date | null> = Array.from({ length: firstDay }, () => null);
    for (let day = 1; day <= totalDays; day += 1) cells.push(new Date(year, month, day));
    return cells;
  }, [visibleMonth, weekStart]);

  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(language, { weekday: 'short' }).format(new Date(2024, 0, 7 + ((weekStart + index) % 7))).replace('.', '')
  ), [language, weekStart]);

  const weekdayLabel = selectedDate.toLocaleDateString(language, { weekday: 'long' }).toUpperCase();
  const monthLabel = visibleMonth.toLocaleDateString(language, { month: 'long', year: 'numeric' }).toUpperCase();

  return (
    <div className="glass-widget p-3 flex gap-3 w-full h-full min-h-0">
      <div className="glass-widget__ambient" />
      <div className="flex flex-col items-center justify-center shrink-0 z-10">
        <div className="relative w-24 h-24 rounded-full border-2 border-white/20 bg-black/30 shadow-inner flex items-center justify-center">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className={`absolute w-0.5 rounded-full ${i % 3 === 0 ? 'h-2 bg-white' : 'h-1 bg-white/40'}`} style={{ top: '4px', transformOrigin: '50% 44px', transform: `rotate(${i * 30}deg)` }} />
          ))}
          <div className="absolute w-1 bg-white rounded-full z-10" style={{ height: '24px', bottom: '48px', transformOrigin: '50% 100%', transform: `rotate(${hrDeg}deg)` }} />
          <div className="absolute w-0.5 bg-blue-300 rounded-full z-20" style={{ height: '34px', bottom: '48px', transformOrigin: '50% 100%', transform: `rotate(${minDeg}deg)` }} />
          <div className="absolute w-[1px] bg-red-500 rounded-full z-30" style={{ height: '38px', bottom: '48px', transformOrigin: '50% 100%', transform: `rotate(${secDeg}deg)` }} />
          <div className="absolute w-2 h-2 rounded-full bg-red-500 border border-white z-40" />
        </div>
        <div className="text-[11px] font-bold mt-2 tracking-wider text-gray-200">
          {now.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between z-10 border-l border-white/10 pl-3 min-w-0">
        <div>
          <div className="flex items-center justify-between gap-1 text-[10px] font-bold tracking-wider">
            <span className="text-red-400 truncate">{weekdayLabel}</span>
            <span className="text-gray-400 truncate">{monthLabel}</span>
          </div>
          <div className="text-2xl font-black leading-none my-1">{selectedDate.getDate()}</div>
        </div>

        <div className="text-[9px]">
          <div className="flex items-center justify-between mb-1">
            <button type="button" onClick={() => moveCalendarMonth(-1)} className="px-1 text-gray-300 hover:text-white" aria-label={language === 'ru' ? 'Предыдущий месяц' : 'Previous month'}>‹</button>
            <button type="button" onClick={() => { selectCalendarDate(new Date()); onOpenCalendar?.(); }} className="text-[8px] text-gray-400 hover:text-white">{language === 'ru' ? 'Сегодня' : 'Today'}</button>
            <button type="button" onClick={() => moveCalendarMonth(1)} className="px-1 text-gray-300 hover:text-white" aria-label={language === 'ru' ? 'Следующий месяц' : 'Next month'}>›</button>
          </div>
          <div className="grid grid-cols-7 text-center text-gray-400 mb-1 font-semibold">
            {weekdays.map((weekday, index) => <span key={index} className={index >= 5 ? 'text-orange-400/80' : ''}>{weekday}</span>)}
          </div>
          <div className="grid grid-cols-7 text-center gap-y-0.5 font-mono">
            {monthDays.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} aria-hidden="true">·</span>;
              const sameDay = date.getFullYear() === selectedDate.getFullYear() && date.getMonth() === selectedDate.getMonth() && date.getDate() === selectedDate.getDate();
              const today = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
              const holidays = getHolidaysForDate(date);
              const hasEvents = getCalendarEventsForDate(date).length > 0 || holidays.length > 0;
              const weekend = isSelectedCountryWeekend(date, labourCountries);
              const makeupWork = isMakeupWorkday(date, labourCountries);
              const holidayTitle = holidays.map((holiday) => `${NATIONAL_COUNTRIES.find((country) => country.code === holiday.country)?.flag ?? ''} ${getHolidayTitle(holiday, language)}`).join(', ');
              const dayOffTitle = weekend ? (language === 'ru' ? 'Выходной' : 'Day off') : '';
              const makeupWorkTitle = makeupWork ? (language === 'ru' ? 'Рабочий день' : 'Working day') : '';
              return (
                <button type="button" key={date.toISOString()} aria-pressed={sameDay} title={[dayOffTitle, makeupWorkTitle, holidayTitle, ...getCalendarEventsForDate(date).map((event) => event.summary)].filter(Boolean).join(' · ') || date.toLocaleDateString(language)} onClick={() => { selectCalendarDate(date); onOpenCalendar?.(); }} className={`relative py-0.5 rounded-full ${weekend ? 'bg-red-500/20 text-red-100' : ''} ${makeupWork ? 'ring-1 ring-emerald-400/70' : ''} ${sameDay ? 'bg-red-500 text-white font-bold' : today ? 'ring-1 ring-red-400 text-white' : 'text-gray-300'}`}>
                  {date.getDate()}
                  {hasEvents && <i aria-hidden="true" className={`absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${holidays.length ? 'bg-red-300' : makeupWork ? 'bg-emerald-300' : 'bg-cyan-300'}`} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
