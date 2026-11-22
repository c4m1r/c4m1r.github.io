import { useMemo, useState } from 'react';
import { CardView } from '../cards/CardView';
import { GameMenuBar } from '../GameMenuBar';
import { formatClock, useGameClock, useNewGameShortcut } from '../gameHooks';
import {
  CARD_HEIGHT, CARD_WIDTH, createDeck, isAlternatingRun, isRed, SUIT_SYMBOL, SUITS, type Card, pileStep } from '../cards/cards';

/**
 * Klondike Solitaire (the default Windows "Solitaire"), temporary sketch.
 * Click a card (or the waste pile) to select it, then click a legal target:
 * another tableau column, a foundation pile or an empty column.
 * Click the stock to draw one or three cards (Options); when the stock is empty, the waste is turned back.
 * Standard scoring: waste to tableau +5, waste to foundation +10, tableau to foundation +10,
 * turning over a tableau card +5. Score never drops below zero.
 */

export type DrawCount = 1 | 3;

interface KlondikeState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  moves: number;
  score: number;
}

type Source = { kind: 'waste' } | { kind: 'tableau'; col: number; index: number };
type Target = { kind: 'tableau'; col: number } | { kind: 'foundation'; pile: number };

function deal(): KlondikeState {
  const deck = createDeck();
  const tableau: Card[][] = [];
  for (let col = 0; col < 7; col += 1) {
    const pile = deck.splice(0, col + 1);
    pile.forEach((card, index) => { card.faceUp = index === pile.length - 1; });
    tableau.push(pile);
  }
  deck.forEach((card) => { card.faceUp = false; });
  return { stock: deck, waste: [], foundations: [[], [], [], []], tableau, moves: 0, score: 0 };
}

function canPlaceOnTableau(cards: Card[], column: Card[]): boolean {
  const lead = cards[0];
  const top = column[column.length - 1];
  if (!top) return lead.rank === 13;
  return top.faceUp && top.rank === lead.rank + 1 && isRed(top) !== isRed(lead);
}

function canPlaceOnFoundation(card: Card, pile: Card[], pileIndex: number): boolean {
  const top = pile[pile.length - 1];
  if (!top) return card.rank === 1 && card.suit === SUITS[pileIndex];
  return top.suit === card.suit && top.rank === card.rank - 1;
}

function cardsFor(state: KlondikeState, source: Source): Card[] {
  if (source.kind === 'waste') return state.waste.slice(-1);
  return state.tableau[source.col].slice(source.index);
}

/** Returns the new state, or null when the move is not legal. */
function moveScore(source: Source, target: Target): number {
  if (target.kind === 'foundation') return 10;
  return source.kind === 'waste' ? 5 : 0;
}

function applyMove(state: KlondikeState, source: Source, target: Target): KlondikeState | null {
  const moving = cardsFor(state, source);
  if (moving.length === 0) return null;

  if (target.kind === 'foundation') {
    if (moving.length !== 1) return null;
    if (!canPlaceOnFoundation(moving[0], state.foundations[target.pile], target.pile)) return null;
  } else {
    if (source.kind === 'tableau' && !isAlternatingRun(moving)) return null;
    if (!canPlaceOnTableau(moving, state.tableau[target.col])) return null;
    if (source.kind === 'tableau' && target.col === source.col) return null;
  }

  const next: KlondikeState = {
    ...state,
    stock: state.stock,
    waste: [...state.waste],
    foundations: state.foundations.map((pile) => [...pile]),
    tableau: state.tableau.map((column) => [...column]),
    moves: state.moves + 1,
    score: state.score + moveScore(source, target),
  };

  if (source.kind === 'waste') {
    next.waste.pop();
  } else {
    next.tableau[source.col] = next.tableau[source.col].slice(0, source.index);
    const top = next.tableau[source.col][next.tableau[source.col].length - 1];
    if (top && !top.faceUp) {
      top.faceUp = true;
      next.score += 5;
    }
  }

  if (target.kind === 'foundation') {
    next.foundations[target.pile].push(moving[0]);
  } else {
    next.tableau[target.col].push(...moving);
  }
  return next;
}

function drawOrRecycle(state: KlondikeState, count: DrawCount): KlondikeState {
  if (state.stock.length > 0) {
    const stock = [...state.stock];
    const waste = [...state.waste];
    const drawn = Math.min(count, stock.length);
    for (let i = 0; i < drawn; i += 1) {
      const card = stock.pop() as Card;
      card.faceUp = true;
      waste.push(card);
    }
    return { ...state, stock, waste, moves: state.moves + 1 };
  }
  if (state.waste.length === 0) return state;
  const stock = [...state.waste].reverse().map((card) => ({ ...card, faceUp: false }));
  return { ...state, stock, waste: [], moves: state.moves + 1 };
}

export function SolitaireGame() {
  const [state, setState] = useState<KlondikeState>(deal);
  const [selected, setSelected] = useState<Source | null>(null);
  const [drawCount, setDrawCount] = useState<DrawCount>(1);

  const won = useMemo(() => state.foundations.every((pile) => pile.length === 13), [state]);
  const clock = useGameClock(state.moves > 0, won);

  const attempt = (target: Target) => {
    if (!selected) return;
    const next = applyMove(state, selected, target);
    if (next) setState(next);
    setSelected(null);
  };

  const isSelected = (source: Source) => {
    if (!selected) return false;
    if (selected.kind !== source.kind) return false;
    if (selected.kind === 'waste') return true;
    return source.kind === 'tableau' && selected.kind === 'tableau' && selected.col === source.col && selected.index === source.index;
  };

  const clickTableauCard = (col: number, index: number, card: Card) => {
    if (selected) {
      attempt({ kind: 'tableau', col });
      return;
    }
    if (!card.faceUp) return;
    setSelected({ kind: 'tableau', col, index });
  };

  const newGame = () => {
    setState(deal());
    setSelected(null);
    clock.reset();
  };

  const chooseDraw = (count: DrawCount) => {
    setDrawCount(count);
    newGame();
  };

  useNewGameShortcut(newGame);

  const topWaste = state.waste[state.waste.length - 1];

  return (
    <div className="flex h-full flex-col bg-[#008000] text-white">
      <GameMenuBar
        menus={[
          { label: 'Game', items: [{ label: 'New Game', onSelect: newGame }] },
          {
            label: 'Options',
            items: [
              { label: 'Draw One', checked: drawCount === 1, onSelect: () => chooseDraw(1) },
              { label: 'Draw Three', checked: drawCount === 3, onSelect: () => chooseDraw(3) },
            ],
          },
        ]}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3" data-game="solitaire">
      <header className="flex items-center justify-between text-sm">
        <span>
          Score: <strong data-testid="score">{state.score}</strong>
          {' · '}Time: <strong data-testid="time">{formatClock(clock.seconds)}</strong>
          {' · '}Moves: <strong data-testid="moves">{state.moves}</strong>
          {won ? ' — Win!' : ''}
        </span>
      </header>

      <div className="grid grid-cols-7 gap-2">
        <div className="flex flex-col gap-1">
          <CardView
            card={state.stock.length ? state.stock[state.stock.length - 1] : undefined}
            placeholder={state.stock.length ? undefined : '↺'}
            onClick={() => { setSelected(null); setState((s) => drawOrRecycle(s, drawCount)); }}
            testId="stock"
          />
        </div>
        <div className="flex flex-col gap-1">
          {/* Draw Three fans the last three waste cards; only the top card can be played. */}
          {topWaste ? (
            <div className="relative" style={{ width: CARD_WIDTH + 14 * (Math.min(drawCount, state.waste.length) - 1), height: CARD_HEIGHT }}>
              {state.waste.slice(-drawCount).map((card, i, visible) => {
                const isTop = i === visible.length - 1;
                return (
                  <div key={card.id} className="absolute top-0" style={{ left: i * 14 }}>
                    <CardView
                      card={card}
                      selected={isTop && selected?.kind === 'waste'}
                      onClick={isTop ? () => (selected ? setSelected(null) : setSelected({ kind: 'waste' })) : undefined}
                      testId={isTop ? 'waste' : undefined}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <CardView placeholder=" " testId="waste" />
          )}
        </div>
        <div />
        {state.foundations.map((pile, index) => (
          <CardView
            key={SUITS[index]}
            card={pile[pile.length - 1]}
            placeholder={SUIT_SYMBOL[SUITS[index]]}
            onClick={() => attempt({ kind: 'foundation', pile: index })}
            testId={`foundation-${index}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
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
        {selected ? 'Choose a target: a column, a foundation or an empty space.' : 'Click a face-up card to select it, then a legal target.'}
      </p>
    </div>
    </div>
  );
}
