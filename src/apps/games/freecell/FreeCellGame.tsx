import { useMemo, useState } from 'react';
import { CardView } from '../cards/CardView';
import { formatClock, useGameClock, useNewGameShortcut } from '../gameHooks';
import { GameMenuBar } from '../GameMenuBar';
import {
  createDeck, isAlternatingRun, isRed, SUIT_SYMBOL, SUITS, type Card, pileStep } from '../cards/cards';

/**
 * FreeCell (default Windows game since Windows 3.1 via Win32s/NT), temporary sketch.
 * All 52 cards are dealt face up into 8 columns (four with 7 cards, four with 6).
 * Four free cells hold one card each, four foundations build up by suit from Ace.
 * Columns build down in alternating colours; any card may go to an empty column.
 * Several cards can move together when enough free cells and empty columns exist.
 */

interface FreeCellState {
  cells: (Card | null)[];
  foundations: Card[][];
  tableau: Card[][];
  moves: number;
}

type Source = { kind: 'cell'; index: number } | { kind: 'tableau'; col: number; index: number };
type Target = { kind: 'cell'; index: number } | { kind: 'foundation'; pile: number } | { kind: 'tableau'; col: number };

function deal(): FreeCellState {
  const deck = createDeck();
  const tableau: Card[][] = [];
  for (let col = 0; col < 8; col += 1) {
    const size = col < 4 ? 7 : 6;
    const pile = deck.splice(0, size);
    pile.forEach((card) => { card.faceUp = true; });
    tableau.push(pile);
  }
  return { cells: [null, null, null, null], foundations: [[], [], [], []], tableau, moves: 0 };
}

function cardsFor(state: FreeCellState, source: Source): Card[] {
  if (source.kind === 'cell') {
    const card = state.cells[source.index];
    return card ? [card] : [];
  }
  return state.tableau[source.col].slice(source.index);
}

/** Maximum run length movable in one go; an empty destination column does not count as free space. */
function maxRunLength(state: FreeCellState, destinationIsEmptyColumn: boolean): number {
  const freeCells = state.cells.filter((card) => card === null).length;
  const emptyColumns = state.tableau.filter((column) => column.length === 0).length - (destinationIsEmptyColumn ? 1 : 0);
  return (freeCells + 1) * 2 ** Math.max(0, emptyColumns);
}

function canPlaceOnTableau(cards: Card[], column: Card[]): boolean {
  const lead = cards[0];
  const top = column[column.length - 1];
  if (!top) return true;
  return top.rank === lead.rank + 1 && isRed(top) !== isRed(lead);
}

function canPlaceOnFoundation(card: Card, pile: Card[], pileIndex: number): boolean {
  const top = pile[pile.length - 1];
  if (!top) return card.rank === 1 && card.suit === SUITS[pileIndex];
  return top.suit === card.suit && top.rank === card.rank - 1;
}

/** Returns the new state, or null when the move is not legal. */
function applyMove(state: FreeCellState, source: Source, target: Target): FreeCellState | null {
  const moving = cardsFor(state, source);
  if (moving.length === 0) return null;
  if (source.kind === 'tableau' && !isAlternatingRun(moving)) return null;

  if (target.kind === 'cell') {
    if (moving.length !== 1 || state.cells[target.index] !== null) return null;
  } else if (target.kind === 'foundation') {
    if (moving.length !== 1) return null;
    if (!canPlaceOnFoundation(moving[0], state.foundations[target.pile], target.pile)) return null;
  } else {
    if (source.kind === 'tableau' && target.col === source.col) return null;
    const destination = state.tableau[target.col];
    if (!canPlaceOnTableau(moving, destination)) return null;
    if (moving.length > maxRunLength(state, destination.length === 0)) return null;
  }

  const next: FreeCellState = {
    cells: [...state.cells],
    foundations: state.foundations.map((pile) => [...pile]),
    tableau: state.tableau.map((column) => [...column]),
    moves: state.moves + 1,
  };

  if (source.kind === 'cell') {
    next.cells[source.index] = null;
  } else {
    next.tableau[source.col] = next.tableau[source.col].slice(0, source.index);
  }

  if (target.kind === 'cell') next.cells[target.index] = moving[0];
  else if (target.kind === 'foundation') next.foundations[target.pile].push(moving[0]);
  else next.tableau[target.col].push(...moving);
  return next;
}

export function FreeCellGame() {
  const [state, setState] = useState<FreeCellState>(deal);
  const [selected, setSelected] = useState<Source | null>(null);

  const won = useMemo(() => state.foundations.every((pile) => pile.length === 13), [state]);
  const clock = useGameClock(state.moves > 0, won);

  const attempt = (target: Target) => {
    if (!selected) return;
    const next = applyMove(state, selected, target);
    if (next) setState(next);
    setSelected(null);
  };

  const isSelected = (source: Source) => {
    if (!selected || selected.kind !== source.kind) return false;
    if (selected.kind === 'cell' && source.kind === 'cell') return selected.index === source.index;
    if (selected.kind === 'tableau' && source.kind === 'tableau') {
      return selected.col === source.col && selected.index === source.index;
    }
    return false;
  };

  const clickCell = (index: number) => {
    if (selected) {
      attempt({ kind: 'cell', index });
      return;
    }
    if (state.cells[index]) setSelected({ kind: 'cell', index });
  };

  const clickTableauCard = (col: number, index: number, card: Card) => {
    if (selected) {
      attempt({ kind: 'tableau', col });
      return;
    }
    if (card.faceUp) setSelected({ kind: 'tableau', col, index });
  };

  const newGame = () => {
    setState(deal());
    setSelected(null);
    clock.reset();
  };

  useNewGameShortcut(newGame);

  return (
    <div className="flex h-full flex-col bg-[#008000] text-white">
      <GameMenuBar menus={[{ label: 'Game', items: [{ label: 'New Game', onSelect: newGame }] }]} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3" data-game="freecell">
      <header className="flex items-center justify-between text-sm">
        <span>
          Time: <strong data-testid="time">{formatClock(clock.seconds)}</strong>
          {' · '}Moves: <strong data-testid="moves">{state.moves}</strong>
          {won ? ' — Win!' : ''}
        </span>
        <button type="button" onClick={newGame} className="rounded bg-white/15 px-3 py-1">New game</button>
      </header>

      <div className="grid grid-cols-8 gap-2">
        {state.cells.map((card, index) => (
          <CardView
            key={`cell-${index}`}
            card={card ?? undefined}
            selected={isSelected({ kind: 'cell', index })}
            placeholder=" "
            onClick={() => clickCell(index)}
            testId={`cell-${index}`}
          />
        ))}
        {state.foundations.map((pile, index) => (
          <CardView
            key={`foundation-${SUITS[index]}`}
            card={pile[pile.length - 1]}
            placeholder={SUIT_SYMBOL[SUITS[index]]}
            onClick={() => attempt({ kind: 'foundation', pile: index })}
            testId={`foundation-${index}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-8 gap-2">
        {state.tableau.map((column, col) => (
          <div key={col} className="flex min-h-[86px] flex-col" data-testid={`column-${col}`}>
            {column.length === 0 && (
              <CardView placeholder=" " onClick={() => attempt({ kind: 'tableau', col })} testId={`empty-${col}`} />
            )}
            {column.map((card, index) => (
              <div key={card.id} style={{ marginTop: index === 0 ? 0 : pileStep(column[index - 1], card) }}>
                <CardView
                  card={card}
                  selected={isSelected({ kind: 'tableau', col, index })}
                  onClick={() => clickTableauCard(col, index, card)}
                  testId={`card-${col}-${index}`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="text-xs text-white/70">
        {selected ? 'Choose a target: a free cell, a foundation or a column.' : 'Click a card to select it (a run moves together), then a legal target.'}
      </p>
    </div>
    </div>
  );
}
