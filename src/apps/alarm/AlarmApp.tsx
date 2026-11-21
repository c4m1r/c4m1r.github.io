import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useApp } from '../../contexts/useApp';

/**
 * One canonical Alarm app for every Windows-family OS. Its icon comes from the
 * active OS registry (alarmIcon); each OS without a native alarm icon uses its
 * generic .exe application icon.
 */

type Alarm = { id: string; time: string; label: string; enabled: boolean };

const STORAGE_KEY = 'webos-alarms-v1';
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const UI = {
  ru: { title: 'Будильник', now: 'Текущее время', add: 'Добавить', time: 'Время', label: 'Название', defaultLabel: 'Будильник', empty: 'Будильников нет', remove: 'Удалить', invalid: 'Укажите время в формате ЧЧ:ММ', ringing: 'Сработал будильник', dismiss: 'Отключить звонок', repeat: 'Каждый день' },
  en: { title: 'Alarm', now: 'Current time', add: 'Add', time: 'Time', label: 'Label', defaultLabel: 'Alarm', empty: 'No alarms', remove: 'Delete', invalid: 'Enter the time as HH:MM', ringing: 'Alarm is ringing', dismiss: 'Dismiss', repeat: 'Every day' },
  fr: { title: 'Alarme', now: 'Heure actuelle', add: 'Ajouter', time: 'Heure', label: 'Libellé', defaultLabel: 'Alarme', empty: 'Aucune alarme', remove: 'Supprimer', invalid: 'Saisissez l’heure au format HH:MM', ringing: 'L’alarme sonne', dismiss: 'Arrêter', repeat: 'Tous les jours' },
  es: { title: 'Alarma', now: 'Hora actual', add: 'Añadir', time: 'Hora', label: 'Nombre', defaultLabel: 'Alarma', empty: 'No hay alarmas', remove: 'Eliminar', invalid: 'Introduce la hora en formato HH:MM', ringing: 'La alarma está sonando', dismiss: 'Desactivar', repeat: 'Todos los días' },
  zh: { title: '闹钟', now: '当前时间', add: '添加', time: '时间', label: '名称', defaultLabel: '闹钟', empty: '没有闹钟', remove: '删除', invalid: '请以 HH:MM 格式输入时间', ringing: '闹钟响了', dismiss: '关闭', repeat: '每天' },
  ja: { title: 'アラーム', now: '現在時刻', add: '追加', time: '時刻', label: 'ラベル', defaultLabel: 'アラーム', empty: 'アラームはありません', remove: '削除', invalid: '時刻は HH:MM 形式で入力してください', ringing: 'アラームが鳴っています', dismiss: '停止', repeat: '毎日' },
  ko: { title: '알람', now: '현재 시간', add: '추가', time: '시간', label: '이름', defaultLabel: '알람', empty: '알람이 없습니다', remove: '삭제', invalid: '시간을 HH:MM 형식으로 입력하세요', ringing: '알람이 울리고 있습니다', dismiss: '끄기', repeat: '매일' },
} as const;

function loadAlarms(): Alarm[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Alarm =>
      typeof item?.id === 'string' && typeof item?.time === 'string' && TIME_PATTERN.test(item.time)
      && typeof item?.label === 'string' && typeof item?.enabled === 'boolean');
  } catch {
    return [];
  }
}

function saveAlarms(alarms: Alarm[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  } catch {
    // Storage can be blocked; the alarms still work for this session.
  }
}

const pad = (value: number) => String(value).padStart(2, '0');

export function AlarmApp() {
  const { language } = useApp();
  const t = UI[language.split('-')[0] as keyof typeof UI] ?? UI.en;

  const [alarms, setAlarms] = useState<Alarm[]>(loadAlarms);
  const [now, setNow] = useState(() => new Date());
  const [ringing, setRinging] = useState<string[]>([]);
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const firedAt = useRef<Record<string, string>>({});

  useEffect(() => {
    saveAlarms(alarms);
  }, [alarms]);

  useEffect(() => {
    const tick = () => {
      const current = new Date();
      setNow(current);
      const hhmm = `${pad(current.getHours())}:${pad(current.getMinutes())}`;
      const stamp = `${current.toDateString()} ${hhmm}`;
      const due = alarms.filter((alarm) => alarm.enabled && alarm.time === hhmm && firedAt.current[alarm.id] !== stamp);
      if (due.length === 0) return;
      due.forEach((alarm) => { firedAt.current[alarm.id] = stamp; });
      setRinging((prev) => [...prev, ...due.map((alarm) => alarm.id).filter((id) => !prev.includes(id))]);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [alarms]);

  const onAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!TIME_PATTERN.test(time)) {
      setError(t.invalid);
      return;
    }
    setError('');
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    setAlarms((prev) => [...prev, { id, time, label: label.trim() || t.defaultLabel, enabled: true }]);
    setLabel('');
  };

  const toggle = (id: string) => setAlarms((prev) => prev.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm)));
  const remove = (id: string) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
    setRinging((prev) => prev.filter((ringingId) => ringingId !== id));
  };
  const dismiss = (id: string) => setRinging((prev) => prev.filter((ringingId) => ringingId !== id));

  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const ringingAlarms = alarms.filter((alarm) => ringing.includes(alarm.id));

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4 text-sm" data-app="alarm">
      <header className="flex flex-col items-center gap-1">
        <span className="text-xs opacity-70">{t.now}</span>
        <time className="font-mono text-3xl tabular-nums" dateTime={now.toISOString()}>{clock}</time>
      </header>

      {ringingAlarms.length > 0 && (
        <div role="alert" className="flex flex-col gap-2 rounded border border-current p-2">
          <strong>{t.ringing}</strong>
          {ringingAlarms.map((alarm) => (
            <div key={alarm.id} className="flex items-center justify-between gap-2">
              <span className="font-mono">{alarm.time} {alarm.label}</span>
              <button type="button" onClick={() => dismiss(alarm.id)}>{t.dismiss}</button>
            </div>
          ))}
        </div>
      )}

      <ul className="flex flex-col gap-1">
        {alarms.length === 0 && <li className="opacity-70">{t.empty}</li>}
        {alarms.map((alarm) => (
          <li key={alarm.id} className="flex items-center justify-between gap-2 rounded border border-transparent px-2 py-1">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={alarm.enabled} onChange={() => toggle(alarm.id)} />
              <span className="font-mono">{alarm.time}</span>
              <span>{alarm.label}</span>
              <span className="text-xs opacity-60">{t.repeat}</span>
            </label>
            <button type="button" onClick={() => remove(alarm.id)}>{t.remove}</button>
          </li>
        ))}
      </ul>

      <form onSubmit={onAdd} className="flex flex-wrap items-end gap-2 border-t pt-3">
        <label className="flex flex-col gap-1">
          <span>{t.time}</span>
          <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
        </label>
        <label className="flex flex-col gap-1">
          <span>{t.label}</span>
          <input type="text" value={label} onChange={(event) => setLabel(event.target.value)} placeholder={t.defaultLabel} />
        </label>
        <button type="submit">{t.add}</button>
        {error && <p role="status" className="basis-full text-xs">{error}</p>}
      </form>
    </div>
  );
}
