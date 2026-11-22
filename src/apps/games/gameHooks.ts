import { useEffect, useRef, useState } from 'react';

/** Runs `action` when the F2 key is pressed (the classic New Game shortcut). */
export function useNewGameShortcut(action: () => void) {
  const actionRef = useRef(action);
  useEffect(() => { actionRef.current = action; }, [action]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'F2') return;
      event.preventDefault();
      actionRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/**
 * Seconds since the first move of a game. The clock starts when `started` becomes true,
 * stops when `stopped` is true, and returns to zero through `reset`.
 */
export function useGameClock(started: boolean, stopped: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!started || stopped) return;
    const id = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(id);
  }, [started, stopped]);
  return { seconds, reset: () => setSeconds(0) };
}

/** m:ss, the format of the classic Time field. */
export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, '0')}`;
}
