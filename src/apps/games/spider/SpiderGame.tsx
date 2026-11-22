import { useMemo, useState } from 'react';
import { CardView } from '../cards/CardView';
import { rankLabel, SUITS, type Card, type Suit, pileStep } from '../cards/cards';

/**
 * Spider Solitaire (shipped with Windows XP–10), temporary sketch.
 * Two decks (104 cards) are dealt into 10 columns: four with 6 cards, six with 5.
 * The last card of each column is face up; the remaining 50 cards form five stock deals.
 * Build runs down from King to Ace in one suit: a run of the same suit moves as a unit
 * onto any card one rank higher (any suit), or into an empty column.
 * A complete King-to-Ace run in one suit is removed to the foundation.
 * Dealing a stock row is not allowed while a column is empty.
 * The suit count (1, 2 or 4) follows the classic difficulty levels; the default is one suit.
 */

const COLUMNS = 10;
const SUIT_COUNT = 1;

interface SpiderState {
  columns: Card[][];
  stock: Card[][];
  completed: number;
  moves: number;
  suits: Suit[];
}

type Selection = { col: number; index: number } | null;

function deal(suitCount: number = SUIT_COUNT): SpiderState {
  const suits = SUITS.slice(0, suitCount === 4 ? 4 : suitCount === 2 ? 2 : 1);
  const cards: Card[] = [];
  for (let set = 0; set < 8; set += 1) {
    const suit = suits[set % suits.length];
    for (let rank = 1; rank <= 13; rank += 1) {
      cards.push({ id: `${suit}${rank}-${set}`, suit, rank, faceUp: false });
    }
  }
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  const columns: Card[][] = [];
  for (let col = 0; col < COLUMNS; col += 1) {
    const size = col < 4 ? 6 : 5;
    const pile = cards.splice(0, size);
    pile.forEach((card, index) => { card.faceUp = index === pile.length - 1; });
    columns.push(pile);
  }
  const stock: Card[][] = [];
  for (let deal = 0; deal < 5; deal += 1) {
    stock.push(cards.splice(0, COLUMNS).map((card) => ({ ...card, faceUp: false })));
  }
  return { columns, stock, completed: 0, moves: 0, suits };
}

/** Length of the same-suit descending run that starts at `index` and reaches the column end. */
function runLength(column: Card[], index: number): number {
  if (!column[index]?.faceUp) return 0;
  for (let i = index; i < column.length - 1; i += 1) {
    const a = column[i];
    const b = column[i + 1];
    if (!b.faceUp || b.suit !== a.suit || b.rank !== a.rank - 1) return 0;
  }
  return column.length - index;
}

/** Removes a finished K..A run of one suit from the end of a column; returns the new state. */
function collectFinishedRun(state: SpiderState, col: number): SpiderState {
  const column = state.columns[col];
  if (column.length < 13) return state;
  const start = column.length - 13;
  const run = column.slice(start);
  const complete = run[0].rank === 13 && runLength(column, start) === 13;
  if (!complete) return state;
  const columns = state.columns.map((cards, index) => (index === col ? cards.slice(0, start) : cards));
  const top = columns[col][columns[col].length - 1];
  if (top && !top.faceUp) top.faceUp = true;
  return { ...state, columns, completed: state.completed + 1 };
}

function moveRun(state: SpiderState, from: Selection, to: number): SpiderState | null {
  if (!from || from.col === to) return null;
  const source = state.columns[from.col];
  const length = runLength(source, from.index);
  if (length === 0) return null;
  const run = source.slice(from.index);
  const destination = state.columns[to];
  const top = destination[destination.length - 1];
  if (top && !(top.faceUp && top.rank === run[0].rank + 1)) return null;

  const columns = state.columns.map((cards) => [...cards]);
  columns[from.col] = source.slice(0, from.index);
  const exposed = columns[from.col][columns[from.col].length - 1];
  if (exposed && !exposed.faceUp) exposed.faceUp = true;
  columns[to] = [...destination, ...run];

  return collectFinishedRun({ ...state, columns, moves: state.moves + 1 }, to);
}

function dealRow(state: SpiderState): SpiderState | null {
  if (state.stock.length === 0) return null;
  if (state.columns.some((column) => column.length === 0)) return null;
  const [row, ...rest] = state.stock;
  const columns = state.columns.map((column, index) => {
    const card = { ...row[index], faceUp: true };
    return [...column, card];
  });
  let next: SpiderState = { ...state, columns, stock: rest, moves: state.moves + 1 };
  for (let col = 0; col < COLUMNS; col += 1) next = collectFinishedRun(next, col);
  return next;
}

export function SpiderGame() {
  const [state, setState] = useState<SpiderState>(() => deal());
  const [selected, setSelected] = useState<Selection>(null);

  const won = useMemo(() => state.completed === 8, [state.completed]);

  const clickCard = (col: number, index: number, card: Card) => {
    if (selected) {
      const next = moveRun(state, selected, col);
      if (next) setState(next);
      setSelected(null);
      return;
    }
    if (card.faceUp && runLength(state.columns[col], index) > 0) setSelected({ col, index });
  };

  const clickEmpty = (col: number) => {
    if (!selected) return;
    const next = moveRun(state, selected, col);
    if (next) setState(next);
    setSelected(null);
  };

  const newGame = () => {
    setState(deal(state.suits.length));
    setSelected(null);
  };

  const deals = state.stock.length;

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto bg-[#008000] p-3 text-white" data-game="spider">
      <header className="flex items-center justify-between gap-2 text-sm">
        <span>
          Completed: <strong data-testid="completed">{state.completed}</strong>/8 · Moves: <strong data-testid="moves">{state.moves}</strong>{won ? ' — Win!' : ''}
        </span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setState((s) => dealRow(s) ?? s); setSelected(null); }}
            disabled={deals === 0}
            className="rounded bg-white/15 px-3 py-1 disabled:opacity-40"
            data-testid="deal"
          >
            Deal ({deals})
          </button>
          <button type="button" onClick={newGame} className="rounded bg-white/15 px-3 py-1">New game</button>
        </span>
      </header>

      <div className="grid grid-cols-10 gap-1" data-testid="columns">
        {state.columns.map((column, col) => (
          <div key={col} className="flex min-h-[86px] flex-col" data-testid={`column-${col}`}>
            {column.length === 0 && (
              <CardView placeholder=" " onClick={() => clickEmpty(col)} testId={`empty-${col}`} />
            )}
            {column.map((card, index) => {
              const inRun = selected && selected.col === col && index >= selected.index;
              return (
                <div key={card.id} style={{ marginTop: index === 0 ? 0 : pileStep(column[index - 1], card) }}>
                  <CardView
                    card={card}
                    selected={Boolean(inRun)}
                    onClick={() => clickCard(col, index, card)}
                    testId={`card-${col}-${index}`}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-xs text-white/70">
        {selected
          ? 'Choose a column: the run goes onto a card one rank higher, or into an empty column.'
          : `Select a same-suit run (${rankLabel(13)} to ${rankLabel(1)} in order) to move it.`}
      </p>
    </div>
  );
}
