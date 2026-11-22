import { useEffect, useState } from 'react';
import { CardView } from '../cards/CardView';
import type { Card } from '../cards/cards';
import {
  applyPass, chooseComputerCard, chooseComputerPass, cardPoints, HUMAN, leaderOf, legalPlays,
  PASS_ORDER, PLAYER_COUNT, scoreRound, TARGET_SCORE, trickWinner, deal,
  type PassDirection, type PlayedCard,
} from './heartsLogic';

/**
 * Hearts (Microsoft Hearts, shipped with Windows 3.1–7), temporary sketch.
 * Passing: select three cards in your hand, then press Pass.
 * Playing: click a card you are allowed to play (dimmed cards are not legal).
 * Computer players play automatically; a finished trick stays visible for a moment.
 */

type Phase = 'passing' | 'playing' | 'roundOver' | 'gameOver';

interface HeartsState {
  hands: Card[][];
  trick: PlayedCard[];
  turn: number;
  heartsBroken: boolean;
  firstTrick: boolean;
  taken: Card[][];
  direction: PassDirection;
  phase: Phase;
  selected: string[];
  roundNo: number;
  totals: number[];
  lastRound: number[] | null;
}

function startRound(roundNo: number, totals: number[]): HeartsState {
  const hands = deal();
  const direction = PASS_ORDER[roundNo % PASS_ORDER.length];
  const base: HeartsState = {
    hands,
    trick: [],
    turn: leaderOf(hands),
    heartsBroken: false,
    firstTrick: true,
    taken: [[], [], [], []],
    direction,
    phase: 'passing',
    selected: [],
    roundNo,
    totals,
    lastRound: null,
  };
  return direction === 'none' ? { ...base, phase: 'playing' } : base;
}

export function HeartsGame() {
  const [state, setState] = useState<HeartsState>(() => startRound(0, [0, 0, 0, 0]));
  const { hands, trick, turn, heartsBroken, firstTrick, phase, selected } = state;

  // Computer opponents pass automatically when the human has chosen three cards.
  const passCards = () => {
    const human = hands[HUMAN].filter((card) => selected.includes(card.id));
    if (human.length !== 3) return;
    const selections = hands.map((hand, player) => (player === HUMAN ? human : chooseComputerPass(hand)));
    const passed = applyPass(hands, selections, state.direction);
    setState((s) => ({ ...s, hands: passed, phase: 'playing', turn: leaderOf(passed), selected: [] }));
  };

  // Computer turn.
  useEffect(() => {
    if (phase !== 'playing' || trick.length >= PLAYER_COUNT || turn === HUMAN || hands[turn].length === 0) return;
    const timer = window.setTimeout(() => {
      const card = chooseComputerCard(hands[turn], trick, turn, heartsBroken, firstTrick);
      setState((s) => playCard(s, turn, card));
    }, 550);
    return () => window.clearTimeout(timer);
  }, [phase, trick, turn, hands, heartsBroken, firstTrick]);

  // Trick resolution after a short pause.
  useEffect(() => {
    if (phase !== 'playing' || trick.length !== PLAYER_COUNT) return;
    const timer = window.setTimeout(() => {
      setState((s) => {
        const winner = trickWinner(s.trick);
        const taken = s.taken.map((cards, player) => (
          player === winner ? [...cards, ...s.trick.map((entry) => entry.card)] : cards
        ));
        return { ...s, taken, trick: [], turn: winner, firstTrick: false };
      });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [phase, trick]);

  // End of round.
  useEffect(() => {
    if (phase !== 'playing' || trick.length !== 0 || hands.some((hand) => hand.length > 0)) return;
    setState((s) => {
      const delta = scoreRound(s.taken);
      const totals = s.totals.map((total, player) => total + delta[player]);
      const over = totals.some((total) => total >= TARGET_SCORE);
      return { ...s, totals, lastRound: delta, phase: over ? 'gameOver' : 'roundOver' };
    });
  }, [phase, trick, hands]);

  const playCard = (s: HeartsState, player: number, card: Card): HeartsState => {
    const hand = s.hands[player].filter((entry) => entry.id !== card.id);
    const hands = s.hands.map((cards, index) => (index === player ? hand : cards));
    const played = [...s.trick, { player, card }];
    const broken = s.heartsBroken || card.suit === 'H' || (card.suit === 'S' && card.rank === 12);
    const next = { ...s, hands, trick: played, heartsBroken: broken };
    return { ...next, turn: (player + 1) % PLAYER_COUNT };
  };

  const toggleSelect = (card: Card) => {
    setState((s) => {
      if (s.selected.includes(card.id)) return { ...s, selected: s.selected.filter((id) => id !== card.id) };
      if (s.selected.length >= 3) return s;
      return { ...s, selected: [...s.selected, card.id] };
    });
  };

  const humanPlay = (card: Card) => {
    if (phase !== 'playing' || turn !== HUMAN) return;
    const legal = legalPlays(hands[HUMAN], trick, heartsBroken, firstTrick, trick.length === 0);
    if (!legal.some((entry) => entry.id === card.id)) return;
    setState((s) => playCard(s, HUMAN, card));
  };

  const nextRound = () => setState((s) => startRound(s.roundNo + 1, s.totals));
  const newGame = () => setState(() => startRound(0, [0, 0, 0, 0]));

  const legal = phase === 'playing' && turn === HUMAN
    ? legalPlays(hands[HUMAN], trick, heartsBroken, firstTrick, trick.length === 0).map((card) => card.id)
    : [];

  const seatLabel = ['You', 'West', 'North', 'East'];
  const winner = state.totals.indexOf(Math.min(...state.totals));

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto bg-[#008000] p-3 text-white" data-game="hearts">
      <header className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>Round {state.roundNo + 1} · Pass: {state.direction}{heartsBroken ? ' · hearts broken' : ''}</span>
        <span className="flex gap-3">
          {state.totals.map((total, player) => (
            <span key={player} data-testid={`score-${player}`}>{seatLabel[player]}: <strong>{total}</strong></span>
          ))}
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <div className="text-xs opacity-80">{seatLabel[2]} · {hands[2].length}</div>
        <div className="flex w-full items-center justify-between">
          <span className="text-xs opacity-80">{seatLabel[1]} · {hands[1].length}</span>
          <div className="grid h-[110px] w-[200px] grid-cols-2 place-items-center gap-1 rounded-lg bg-black/15 p-2" data-testid="trick">
            {trick.map((entry) => (
              <div key={entry.card.id} className="scale-75 text-[10px]">
                <CardView card={entry.card} />
              </div>
            ))}
          </div>
          <span className="text-xs opacity-80">{seatLabel[3]} · {hands[3].length}</span>
        </div>
      </div>

      {phase === 'passing' && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <span>Select 3 cards to pass {state.direction}: {selected.length}/3</span>
          <button type="button" disabled={selected.length !== 3} onClick={passCards} className="rounded bg-white/20 px-3 py-1 disabled:opacity-40">Pass</button>
        </div>
      )}

      {(phase === 'roundOver' || phase === 'gameOver') && (
        <div className="flex flex-col items-center gap-2 text-sm" data-testid="round-result">
          {phase === 'gameOver' ? (
            <>
              <strong>Game over. Lowest score wins: {seatLabel[winner]}.</strong>
              <button type="button" onClick={newGame} className="rounded bg-white/20 px-3 py-1">New game</button>
            </>
          ) : (
            <>
              <span>Round points: {state.lastRound?.join(' · ')}</span>
              <button type="button" onClick={nextRound} className="rounded bg-white/20 px-3 py-1">Next deal</button>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-1" data-testid="hand">
        {hands[HUMAN].map((card) => {
          const isLegal = legal.includes(card.id);
          const isSelected = selected.includes(card.id);
          const clickable = phase === 'passing' || isLegal;
          return (
            <div
              key={card.id}
              className={`${clickable ? '' : 'opacity-50'} ${isSelected ? '-translate-y-2' : ''}`}
              title={`${card.suit}${card.rank} · ${cardPoints(card)} pts`}
            >
              <CardView
                card={card}
                selected={isSelected}
                onClick={() => (phase === 'passing' ? toggleSelect(card) : humanPlay(card))}
                testId={`hand-${card.id}`}
              />
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-white/70">
        {phase === 'passing'
          ? 'Choose three cards to give to the next player.'
          : turn === HUMAN ? 'Your turn: play a highlighted card.' : 'Waiting for the other players…'}
      </p>
    </div>
  );
}
