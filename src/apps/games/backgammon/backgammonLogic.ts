/**
 * Backgammon rules for the Internet Backgammon sketch (no doubling cube, no gammons).
 * Points are indexed 0..23. Positive counts are White checkers, negative counts are Black.
 * White moves from index 23 down to 0 and bears off past 0; Black moves 0 up to 23 and bears off past 23.
 * Temporary sketch: follows the standard rules of backgammon.
 */

export type Player = 'W' | 'B';

export interface BackgammonState {
  points: number[];
  bar: Record<Player, number>;
  off: Record<Player, number>;
}

export interface Move {
  from: number | 'bar';
  to: number | 'off';
  die: number;
  hit: boolean;
}

export function initialState(): BackgammonState {
  const points = Array<number>(24).fill(0);
  points[23] = 2;
  points[12] = 5;
  points[7] = 3;
  points[5] = 5;
  points[0] = -2;
  points[11] = -5;
  points[16] = -3;
  points[18] = -5;
  return { points, bar: { W: 0, B: 0 }, off: { W: 0, B: 0 } };
}

const opponentOf = (p: Player): Player => (p === 'W' ? 'B' : 'W');

function countOf(state: BackgammonState, p: Player, index: number): number {
  const value = state.points[index];
  return p === 'W' ? Math.max(0, value) : Math.max(0, -value);
}

function canLand(state: BackgammonState, p: Player, index: number): boolean {
  const value = state.points[index];
  return p === 'W' ? value > -2 : value < 2;
}

function isHitAt(state: BackgammonState, p: Player, index: number): boolean {
  const value = state.points[index];
  return p === 'W' ? value === -1 : value === 1;
}

/** True when every checker of `p` is in its home board, so bearing off is allowed. */
export function allHome(state: BackgammonState, p: Player): boolean {
  if (state.bar[p] > 0) return false;
  for (let i = 0; i < 24; i += 1) {
    if (countOf(state, p, i) === 0) continue;
    if (p === 'W' && i > 5) return false;
    if (p === 'B' && i < 18) return false;
  }
  return true;
}

function bearOffAllowed(state: BackgammonState, p: Player, index: number, die: number): boolean {
  if (!allHome(state, p)) return false;
  if (p === 'W') {
    const distance = index + 1;
    if (die === distance) return true;
    if (die < distance) return false;
    for (let i = index + 1; i < 24; i += 1) if (countOf(state, p, i) > 0) return false;
    return true;
  }
  const distance = 24 - index;
  if (die === distance) return true;
  if (die < distance) return false;
  for (let i = 0; i < index; i += 1) if (countOf(state, p, i) > 0) return false;
  return true;
}

/** Single-die moves for `p`. When checkers are on the bar, only entering moves are legal. */
export function movesForDie(state: BackgammonState, p: Player, die: number): Move[] {
  const moves: Move[] = [];
  if (state.bar[p] > 0) {
    const to = p === 'W' ? 24 - die : die - 1;
    if (canLand(state, p, to)) {
      moves.push({ from: 'bar', to, die, hit: isHitAt(state, p, to) });
    }
    return moves;
  }
  for (let i = 0; i < 24; i += 1) {
    if (countOf(state, p, i) === 0) continue;
    const to = p === 'W' ? i - die : i + die;
    if (to >= 0 && to < 24) {
      if (canLand(state, p, to)) moves.push({ from: i, to, die, hit: isHitAt(state, p, to) });
    } else if (bearOffAllowed(state, p, i, die)) {
      moves.push({ from: i, to: 'off', die, hit: false });
    }
  }
  return moves;
}

/** Applies one move and returns the new state (the input is not changed). */
export function applyMove(state: BackgammonState, p: Player, move: Move): BackgammonState {
  const next: BackgammonState = {
    points: [...state.points],
    bar: { ...state.bar },
    off: { ...state.off },
  };
  const step = p === 'W' ? 1 : -1;
  if (move.from === 'bar') {
    next.bar[p] -= 1;
  } else {
    next.points[move.from] -= step;
  }
  if (move.to === 'off') {
    next.off[p] += 1;
  } else {
    if (move.hit) {
      next.points[move.to] = 0;
      next.bar[opponentOf(p)] += 1;
    }
    next.points[move.to] += step;
  }
  return next;
}

export function hasWon(state: BackgammonState, p: Player): boolean {
  return state.off[p] === 15;
}

/** Dice for a roll; doubles give four moves. */
export function rollDice(random: () => number = Math.random): number[] {
  const a = Math.floor(random() * 6) + 1;
  const b = Math.floor(random() * 6) + 1;
  return a === b ? [a, a, a, a] : [a, b];
}

/** Moves for every remaining die, deduplicated by die value. */
export function legalMoves(state: BackgammonState, p: Player, dice: number[]): Move[] {
  const seen = new Set<number>();
  const moves: Move[] = [];
  for (const die of dice) {
    if (seen.has(die)) continue;
    seen.add(die);
    moves.push(...movesForDie(state, p, die));
  }
  return moves;
}

/** Greedy computer choice: bear off first, then hits, then making points and advancing. */
export function chooseComputerMove(state: BackgammonState, p: Player, dice: number[]): Move | null {
  const candidates = legalMoves(state, p, dice);
  if (candidates.length === 0) return null;
  const score = (move: Move) => {
    let value = 0;
    if (move.to === 'off') value += 10;
    if (move.hit) value += 6;
    if (move.to !== 'off') {
      const target = move.to;
      const ownAfter = countOf(state, p, target);
      if (ownAfter >= 1) value += 3;
      value += p === 'B' ? move.to / 24 : (23 - move.to) / 24;
    }
    return value;
  };
  return candidates.reduce((best, move) => (score(move) > score(best) ? move : best));
}
