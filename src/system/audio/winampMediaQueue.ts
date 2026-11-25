const STORAGE_KEY = 'webos.winamp.mixed-media-order.v1';
const MAX_KEYS = 10000;

export function normalizeWinampMediaOrder(saved: unknown, currentKeys: string[]): string[] {
  const valid = new Set(currentKeys);
  const result: string[] = [];
  const seen = new Set<string>();
  if (Array.isArray(saved)) {
    for (const key of saved) {
      if (typeof key !== 'string' || key.length > 4096 || !valid.has(key) || seen.has(key)) continue;
      seen.add(key);
      result.push(key);
      if (result.length >= MAX_KEYS) break;
    }
  }
  for (const key of currentKeys) {
    if (!seen.has(key)) result.push(key);
  }
  return result;
}

export function moveWinampMediaOrder(keys: string[], index: number, direction: -1 | 1): string[] {
  const target = index + direction;
  if (!Number.isInteger(index) || index < 0 || target < 0 || target >= keys.length) return keys;
  const next = [...keys];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function readWinampMediaOrder(currentKeys: string[], storage?: Pick<Storage, 'getItem'>): string[] {
  try {
    const source = storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined);
    if (!source) return [...currentKeys];
    const raw = source.getItem(STORAGE_KEY);
    return normalizeWinampMediaOrder(raw ? JSON.parse(raw) : [], currentKeys);
  } catch {
    return [...currentKeys];
  }
}

export function writeWinampMediaOrder(keys: string[], storage?: Pick<Storage, 'setItem'>): boolean {
  try {
    const target = storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined);
    if (!target) return false;
    target.setItem(STORAGE_KEY, JSON.stringify(keys.slice(0, MAX_KEYS)));
    return true;
  } catch {
    return false;
  }
}
