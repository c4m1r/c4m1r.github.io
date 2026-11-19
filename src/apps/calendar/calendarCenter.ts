import { useSyncExternalStore } from 'react';
import { parseICS, type CalendarEvent } from './icsParser';

const CALENDAR_FILES: Record<string, string> = {
  en: new URL('./assets/calendar-en.ics', import.meta.url).toString(),
  ru: new URL('./assets/calendar-ru.ics', import.meta.url).toString(),
};
const SELECTED_DATE_KEY = 'calendar-center-selected-date-v1';
const LOCAL_EVENTS_KEY = 'calendar-center-local-events-v1';

export interface CalendarCenterState {
  selectedDate: Date;
  visibleMonth: Date;
  events: CalendarEvent[];
  loading: boolean;
  loadedLocale: string | null;
  error: string | null;
}

export type CalendarEventInput = Pick<CalendarEvent, 'summary' | 'startDate' | 'endDate'> &
  Partial<Pick<CalendarEvent, 'location' | 'description'>>;

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function parseStoredDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day ? parsed : null;
}

function readInitialDate() {
  if (typeof window !== 'undefined') {
    try {
      const stored = parseStoredDate(window.localStorage.getItem(SELECTED_DATE_KEY));
      if (stored) return stored;
    } catch { /* Storage may be unavailable. */ }
  }
  return dateOnly(new Date());
}

function readLocalEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_EVENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item): CalendarEvent[] => {
      if (!item || typeof item !== 'object') return [];
      const event = item as Record<string, unknown>;
      const startDate = typeof event.startDate === 'string' ? new Date(event.startDate) : new Date(NaN);
      const endDate = typeof event.endDate === 'string' ? new Date(event.endDate) : new Date(NaN);
      if (typeof event.id !== 'string' || typeof event.summary !== 'string' || !event.summary.trim() ||
          Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) return [];
      return [{
        id: event.id, source: 'local', summary: event.summary,
        location: typeof event.location === 'string' ? event.location : '',
        description: typeof event.description === 'string' ? event.description : '',
        startDate, endDate,
      }];
    });
  } catch {
    return [];
  }
}

let localEvents = readLocalEvents();
const initialDate = readInitialDate();
let state: CalendarCenterState = {
  selectedDate: initialDate,
  visibleMonth: new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  events: localEvents,
  loading: false,
  loadedLocale: null,
  error: null,
};
const listeners = new Set<() => void>();
const inFlight = new Map<string, Promise<void>>();
let activeLocaleRequest = '';

function emit() {
  listeners.forEach((listener) => listener());
}

function updateState(patch: Partial<CalendarCenterState>) {
  state = { ...state, ...patch };
  emit();
}

function persistLocalEvents() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(localEvents));
  } catch {
    updateState({ error: 'Local calendar storage is unavailable. Changes may not survive reload.' });
  }
}

function withEventIdentity(events: CalendarEvent[]): CalendarEvent[] {
  return events.map((event, index) => ({
    ...event,
    id: event.id ?? `ics-${dateKey(event.startDate)}-${index}-${event.summary.slice(0, 32)}`,
    source: event.source ?? 'ics',
  }));
}

function publishEvents(icsEvents: CalendarEvent[]) {
  const existingLocal = localEvents;
  updateState({ events: [...withEventIdentity(icsEvents), ...existingLocal].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()) });
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
  const selectedDate = dateOnly(date);
  updateState({ selectedDate, visibleMonth: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) });
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(SELECTED_DATE_KEY, dateKey(selectedDate)); } catch { /* Session-only fallback. */ }
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
  activeLocaleRequest = normalized;
  if (state.loadedLocale === normalized) {
    if (state.loading || state.error) updateState({ loading: false, error: null });
    return;
  }
  const existingRequest = inFlight.get(normalized);
  if (existingRequest) return existingRequest;

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
      if (activeLocaleRequest === normalized) {
        updateState({ loadedLocale: normalized, loading: false, error: null });
        publishEvents(events);
      }
    } catch (primaryError) {
      if (fallback) {
        try {
          const events = await tryFetch(fallback);
          if (activeLocaleRequest === normalized) {
            updateState({ loadedLocale: normalized, loading: false, error: null });
            publishEvents(events);
          }
          return;
        } catch { /* Keep the primary error for diagnostics. */ }
      }
      if (activeLocaleRequest === normalized) {
        updateState({ loading: false, error: primaryError instanceof Error ? primaryError.message : 'Calendar could not be loaded' });
      }
    }
  })().finally(() => inFlight.delete(normalized));
  inFlight.set(normalized, request);
  return request;
}

export function getCalendarEventsForDate(date: Date) {
  const target = dateOnly(date).getTime();
  return state.events.filter((event) => {
    const start = dateOnly(event.startDate).getTime();
    const end = dateOnly(event.endDate).getTime();
    if (event.source === 'local') return target >= start && target <= end;
    // RFC 5545 treats all-day DTEND as exclusive; timed events also appear on their final calendar day.
    if (target === start) return true;
    if (end <= start || target <= start) return false;
    const isAllDayExclusive = event.startDate.getHours() === 0 && event.startDate.getMinutes() === 0 &&
      event.endDate.getHours() === 0 && event.endDate.getMinutes() === 0;
    return isAllDayExclusive ? target < end : target <= end;
  });
}

export function getCalendarEventsForRange(startDate: Date, endDate: Date) {
  const start = dateOnly(startDate).getTime();
  const end = dateOnly(endDate).getTime();
  return state.events.filter((event) => {
    const eventStart = dateOnly(event.startDate).getTime();
    const eventEnd = dateOnly(event.endDate).getTime();
    const isAllDayExclusive = event.source !== 'local' && event.startDate.getHours() === 0 &&
      event.startDate.getMinutes() === 0 && event.endDate.getHours() === 0 && event.endDate.getMinutes() === 0;
    return eventStart <= end && (isAllDayExclusive ? eventEnd > start : eventEnd >= start);
  });
}

export function saveCalendarEvent(input: CalendarEventInput, eventId?: string) {
  const summary = input.summary.trim();
  if (!summary) throw new Error('Event title is required');
  if (Number.isNaN(input.startDate.getTime()) || Number.isNaN(input.endDate.getTime()) || input.endDate < input.startDate) {
    throw new Error('Event end must be the same as or later than its start');
  }
  const id = eventId ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const event: CalendarEvent = {
    id, source: 'local', summary, location: input.location?.trim() ?? '',
    description: input.description?.trim() ?? '',
    startDate: new Date(input.startDate), endDate: new Date(input.endDate),
  };
  localEvents = eventId
    ? localEvents.map((item) => item.id === eventId ? event : item)
    : [...localEvents, event];
  persistLocalEvents();
  updateState({ events: [...state.events.filter((item) => item.source !== 'local' || item.id !== event.id), event].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()) });
  return event;
}

export function deleteCalendarEvent(eventId: string) {
  localEvents = localEvents.filter((event) => event.id !== eventId);
  persistLocalEvents();
  updateState({ events: state.events.filter((event) => event.id !== eventId) });
}
