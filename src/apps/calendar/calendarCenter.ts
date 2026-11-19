import { useSyncExternalStore } from 'react';
import { parseICS, type CalendarEvent } from './icsParser';

const CALENDAR_FILES: Record<string, string> = {
  en: new URL('./assets/calendar-en.ics', import.meta.url).toString(),
  ru: new URL('./assets/calendar-ru.ics', import.meta.url).toString(),
};

export interface CalendarCenterState {
  selectedDate: Date;
  visibleMonth: Date;
  events: CalendarEvent[];
  loading: boolean;
  loadedLocale: string | null;
  error: string | null;
}

function readInitialDate(): Date {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem('calendar-center-selected-date-v1');
      if (stored && /^\d{4}-\d{2}-\d{2}$/.test(stored)) {
        const [year, month, day] = stored.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
    } catch {
      // Storage can be unavailable in private or restricted browsing contexts.
    }
  }
  return new Date();
}

const initialDate = readInitialDate();
let state: CalendarCenterState = {
  selectedDate: initialDate,
  visibleMonth: new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  events: [],
  loading: false,
  loadedLocale: null,
  error: null,
};
const listeners = new Set<() => void>();
const inFlight = new Map<string, Promise<void>>();

function emit() {
  listeners.forEach((listener) => listener());
}

function updateState(patch: Partial<CalendarCenterState>) {
  state = { ...state, ...patch };
  emit();
}

export function getCalendarCenterSnapshot() {
  return state;
}

export function subscribeCalendarCenter(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCalendarCenter() {
  return useSyncExternalStore(subscribeCalendarCenter, getCalendarCenterSnapshot, getCalendarCenterSnapshot);
}

export function selectCalendarDate(date: Date) {
  const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  updateState({
    selectedDate,
    visibleMonth: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  });
  if (typeof window !== 'undefined') {
    try {
      const stored = [selectedDate.getFullYear(), String(selectedDate.getMonth() + 1).padStart(2, '0'), String(selectedDate.getDate()).padStart(2, '0')].join('-');
      window.localStorage.setItem('calendar-center-selected-date-v1', stored);
    } catch {
      // Calendar remains functional for the current session without storage.
    }
  }
}

export function setCalendarVisibleMonth(date: Date) {
  updateState({ visibleMonth: new Date(date.getFullYear(), date.getMonth(), 1) });
}

export function moveCalendarMonth(offset: number) {
  const current = state.visibleMonth;
  setCalendarVisibleMonth(new Date(current.getFullYear(), current.getMonth() + offset, 1));
}

export function goToCalendarToday() {
  selectCalendarDate(new Date());
}

export async function ensureCalendarEvents(locale: string) {
  const normalized = locale.split('-')[0].toLowerCase();
  if (state.loadedLocale === normalized || inFlight.has(normalized)) {
    return inFlight.get(normalized);
  }

  const request = (async () => {
    updateState({ loading: true, error: null });
    const primary = CALENDAR_FILES[normalized] ?? CALENDAR_FILES.en;
    const fallback = normalized === 'en' ? null : CALENDAR_FILES.en;

    const tryFetch = async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Calendar request failed (${response.status})`);
      return parseICS(await response.text());
    };

    try {
      const events = await tryFetch(primary);
      updateState({ events, loadedLocale: normalized, loading: false, error: null });
    } catch (primaryError) {
      if (fallback) {
        try {
          const events = await tryFetch(fallback);
          updateState({ events, loadedLocale: normalized, loading: false, error: null });
          return;
        } catch {
          // Keep the original failure for the visible error state below.
        }
      }
      updateState({
        loading: false,
        error: primaryError instanceof Error ? primaryError.message : 'Calendar could not be loaded',
      });
    }
  })().finally(() => inFlight.delete(normalized));

  inFlight.set(normalized, request);
  return request;
}

export function getCalendarEventsForDate(date: Date) {
  return state.events.filter((event) =>
    event.startDate.getFullYear() === date.getFullYear() &&
    event.startDate.getMonth() === date.getMonth() &&
    event.startDate.getDate() === date.getDate()
  );
}
