import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../contexts/useApp';

export function ClockCalendarWidget() {
  const { language } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours() % 12;

  const secDeg = seconds * 6;
  const minDeg = minutes * 6 + seconds * 0.1;
  const hrDeg = hours * 30 + minutes * 0.5;

  const monthDays = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Monday as start of week (0..6)
    let firstDayOfWeek = new Date(year, month, 1).getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6;

    const cells: Array<{ day: number | null; isToday: boolean }> = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ day: null, isToday: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ day: d, isToday: d === now.getDate() });
    }
    return cells;
  }, [now]);

  const weekdayNamesRu = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const weekdayNamesEn = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const weekdays = language === 'ru' ? weekdayNamesRu : weekdayNamesEn;

  const weekdayLabel = now.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long' }).toUpperCase();
  const monthLabel = now.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long' }).toUpperCase();

  return (
    <div className="glass-widget p-3 flex gap-3 w-full sm:w-[260px] min-h-[220px]">
      <div className="glass-widget__ambient" />

      {/* Analog Clock */}
      <div className="flex flex-col items-center justify-center shrink-0 z-10">
        <div className="relative w-24 h-24 rounded-full border-2 border-white/20 bg-black/30 shadow-inner flex items-center justify-center">
          {/* 12 hour ticks */}
          {Array.from({ length: 12 }, (_, i) => {
            const rot = i * 30;
            return (
              <div
                key={i}
                className={`absolute w-0.5 rounded-full ${i % 3 === 0 ? 'h-2 bg-white' : 'h-1 bg-white/40'}`}
                style={{
                  top: '4px',
                  transformOrigin: '50% 44px',
                  transform: `rotate(${rot}deg)`,
                }}
              />
            );
          })}

          {/* Hour hand */}
          <div
            className="absolute w-1 bg-white rounded-full z-10"
            style={{
              height: '24px',
              bottom: '48px',
              transformOrigin: '50% 100%',
              transform: `rotate(${hrDeg}deg)`,
            }}
          />

          {/* Minute hand */}
          <div
            className="absolute w-0.5 bg-blue-300 rounded-full z-20"
            style={{
              height: '34px',
              bottom: '48px',
              transformOrigin: '50% 100%',
              transform: `rotate(${minDeg}deg)`,
            }}
          />

          {/* Second hand */}
          <div
            className="absolute w-[1px] bg-red-500 rounded-full z-30"
            style={{
              height: '38px',
              bottom: '48px',
              transformOrigin: '50% 100%',
              transform: `rotate(${secDeg}deg)`,
            }}
          />

          {/* Pin */}
          <div className="absolute w-2 h-2 rounded-full bg-red-500 border border-white z-40" />
        </div>

        <div className="text-[11px] font-bold mt-2 tracking-wider text-gray-200">
          {now.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 flex flex-col justify-between z-10 border-l border-white/10 pl-3">
        <div>
          <div className="flex items-baseline justify-between text-[10px] font-bold tracking-wider">
            <span className="text-red-400">{weekdayLabel}</span>
            <span className="text-gray-400">{monthLabel}</span>
          </div>

          <div className="text-2xl font-black leading-none my-1">
            {now.getDate()}
          </div>
        </div>

        {/* Mini Calendar Grid */}
        <div className="text-[9px]">
          <div className="grid grid-cols-7 text-center text-gray-400 mb-1 font-semibold">
            {weekdays.map((w, idx) => (
              <span key={idx} className={idx >= 5 ? 'text-orange-400/80' : ''}>{w}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 text-center gap-y-0.5 font-mono">
            {monthDays.map((item, idx) => (
              <span
                key={idx}
                className={`py-0.5 rounded-full ${
                  item.isToday
                    ? 'bg-red-500 text-white font-bold'
                    : item.day
                    ? 'text-gray-300'
                    : 'text-transparent'
                }`}
              >
                {item.day ?? '·'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
