export interface CalendarEvent {
  id?: string;
  source?: 'ics' | 'local';
  summary: string;
  location?: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

function decodeICSText(value: string) {
  return value.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}

function parseDateValue(value: string, timeZone?: string): Date | null {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?([Zz])?)?$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d, hh = '0', mm = '0', ss = '0', utc] = match;
  const parts = [Number(y), Number(m), Number(d), Number(hh), Number(mm), Number(ss)];
  const [year, month, day, hour, minute, second] = parts;
  if (utc) return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (timeZone) {
    try {
      const targetAsUTC = Date.UTC(year, month - 1, day, hour, minute, second);
      let guess = targetAsUTC;
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
      });
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const formatted = Object.fromEntries(formatter.formatToParts(new Date(guess)).map((part) => [part.type, part.value]));
        const represented = Date.UTC(Number(formatted.year), Number(formatted.month) - 1, Number(formatted.day),
          Number(formatted.hour), Number(formatted.minute), Number(formatted.second));
        const delta = targetAsUTC - represented;
        if (!delta) break;
        guess += delta;
      }
      return new Date(guess);
    } catch {
      // Unknown TZID: preserve the wall-clock value in the user's local zone.
    }
  }
  return new Date(year, month - 1, day, hour, minute, second);
}

interface ICSProperty {
  name: string;
  params: Record<string, string>;
  value: string;
}

function parseProperty(line: string): ICSProperty | null {
  const separator = line.indexOf(':');
  if (separator < 0) return null;
  const descriptor = line.slice(0, separator).split(';');
  const name = descriptor.shift()?.toUpperCase();
  if (!name) return null;
  const params: Record<string, string> = {};
  descriptor.forEach((part) => {
    const equals = part.indexOf('=');
    if (equals > 0) params[part.slice(0, equals).toUpperCase()] = part.slice(equals + 1).replace(/^"|"$/g, '');
  });
  return { name, params, value: line.slice(separator + 1) };
}

export function parseICS(icsData: string): CalendarEvent[] {
  // RFC 5545 folded content lines continue with one leading space or tab.
  const unfolded = icsData.replace(/\r?\n[ \t]/g, '');
  const blocks = unfolded.split(/BEGIN:VEVENT\s*/i).slice(1);
  const events: CalendarEvent[] = [];

  blocks.forEach((block, index) => {
    const body = block.split(/END:VEVENT/i)[0] ?? '';
    const properties = body.split(/\r?\n/).map((line) => parseProperty(line.trim())).filter((item): item is ICSProperty => item !== null);
    const get = (name: string) => properties.find((property) => property.name === name);
    const summary = decodeICSText(get('SUMMARY')?.value ?? '').trim();
    const location = decodeICSText(get('LOCATION')?.value ?? '').trim();
    const description = decodeICSText(get('DESCRIPTION')?.value ?? '').trim();
    const startProperty = get('DTSTART');
    const endProperty = get('DTEND');
    const startDate = startProperty ? parseDateValue(startProperty.value, startProperty.params.TZID) : null;
    const endDate = endProperty ? parseDateValue(endProperty.value, endProperty.params.TZID) : startDate;
    if (!summary || !startDate || !endDate || endDate < startDate) return;
    const uid = get('UID')?.value.trim();
    events.push({
      id: uid ? `ics-${uid}` : `ics-${startDate.getTime()}-${index}`,
      source: 'ics',
      summary,
      location,
      description,
      startDate,
      endDate,
    });
  });

  return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}
