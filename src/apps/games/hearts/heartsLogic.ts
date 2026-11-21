import { createDeck, type Card } from '../cards/cards';

/**
 * Microsoft Hearts rules (the Hearts shipped with Windows 3.1–7), temporary sketch.
 * Four players: index 0 is the human, 1–3 are computer opponents.
 * - Each player gets 13 cards; before play each passes three cards (left, right, across, none).
 * - The holder of the Two of Clubs leads the first trick.
 * - Players must follow suit. Hearts cannot be led until a heart or the Queen of Spades is played.
 * - Hearts score 1 point each, the Queen of Spades 13. Shooting the moon (taking every
 *   heart and the Queen of Spades) scores 0 for the shooter and 26 for everyone else.
 * - The game ends when a player reaches 100; the lowest total wins.
 */

export const PLAYER_COUNT = 4;
export const HUMAN = 0;
export const TARGET_SCORE = 100;

export type PassDirection = 'left' | 'right' | 'across' | 'none';
export const PASS_ORDER: PassDirection[] = ['left', 'right', 'across', 'none'];

export interface PlayedCard {
  player: number;
  card: Card;
}

/** Ace is high in Hearts. */
export function heartsRank(card: Card): number {
  return card.rank === 1 ? 14 : card.rank;
}

export function cardPoints(card: Card): number {
  if (card.suit === 'H') return 1;
  if (card.suit === 'S' && card.rank === 12) return 13;
  return 0;
}

export function isPointCard(card: Card): boolean {
  return cardPoints(card) > 0;
}

export function sortHand(hand: Card[]): Card[] {
  const suitOrder = { C: 0, D: 1, S: 2, H: 3 } as const;
  return [...hand].sort((a, b) => suitOrder[a.suit] - suitOrder[b.suit] || heartsRank(a) - heartsRank(b));
}

export function deal(): Card[][] {
  const deck = createDeck();
  const hands: Card[][] = [[], [], [], []];
  deck.forEach((card, index) => {
    card.faceUp = true;
    hands[index % PLAYER_COUNT].push(card);
  });
  return hands.map(sortHand);
}

export function leaderOf(hands: Card[][]): number {
  return hands.findIndex((hand) => hand.some((card) => card.suit === 'C' && card.rank === 2));
}

export function passTarget(player: number, direction: PassDirection): number | null {
  if (direction === 'left') return (player + 1) % PLAYER_COUNT;
  if (direction === 'right') return (player + PLAYER_COUNT - 1) % PLAYER_COUNT;
  if (direction === 'across') return (player + 2) % PLAYER_COUNT;
  return null;
}

/** Applies a pass. `selections[p]` holds the three cards player p gives away. */
export function applyPass(hands: Card[][], selections: Card[][], direction: PassDirection): Card[][] {
  if (direction === 'none') return hands;
  const next: Card[][] = hands.map((hand, player) => {
    const given = new Set(selections[player].map((card) => card.id));
    return hand.filter((card) => !given.has(card.id));
  });
  selections.forEach((cards, player) => {
    const target = passTarget(player, direction);
    if (target !== null) next[target].push(...cards);
  });
  return next.map(sortHand);
}

/** Cards a player may play now. `trick` holds the cards already played in this trick. */
export function legalPlays(
  hand: Card[],
  trick: PlayedCard[],
  heartsBroken: boolean,
  firstTrick: boolean,
  leadingPlayer: boolean,
): Card[] {
  if (leadingPlayer) {
    if (firstTrick) {
      const opener = hand.filter((card) => card.suit === 'C' && card.rank === 2);
      if (opener.length) return opener;
    }
    const nonHearts = hand.filter((card) => card.suit !== 'H');
    if (!heartsBroken && nonHearts.length > 0) return nonHearts;
    return hand;
  }

  const leadSuit = trick[0].card.suit;
  const following = hand.filter((card) => card.suit === leadSuit);
  if (following.length) return following;

  if (firstTrick) {
    const clean = hand.filter((card) => !isPointCard(card));
    if (clean.length) return clean;
  }
  return hand;
}

export function trickWinner(trick: PlayedCard[]): number {
  const leadSuit = trick[0].card.suit;
  let best = trick[0];
  for (const entry of trick) {
    if (entry.card.suit === leadSuit && heartsRank(entry.card) > heartsRank(best.card)) best = entry;
  }
  return best.player;
}

export function trickPoints(trick: PlayedCard[]): number {
  return trick.reduce((sum, entry) => sum + cardPoints(entry.card), 0);
}

/** Scores for one finished round, after shooting-the-moon adjustment. */
export function scoreRound(taken: Card[][]): number[] {
  const raw = taken.map((cards) => cards.reduce((sum, card) => sum + cardPoints(card), 0));
  const shooter = raw.findIndex((points) => points === 26);
  if (shooter === -1) return raw;
  return raw.map((_, player) => (player === shooter ? 0 : 26));
}

/** Computer play: keep points away from itself, dump the Queen of Spades when void. */
export function chooseComputerCard(
  hand: Card[],
  trick: PlayedCard[],
  player: number,
  heartsBroken: boolean,
  firstTrick: boolean,
): Card {
  const legal = legalPlays(hand, trick, heartsBroken, firstTrick, trick.length === 0);
  const sortedLow = [...legal].sort((a, b) => heartsRank(a) - heartsRank(b));
  if (trick.length === 0) return sortedLow.find((card) => card.suit !== 'H') ?? sortedLow[0];

  const leadSuit = trick[0].card.suit;
  const following = legal.some((card) => card.suit === leadSuit);
  if (following) {
    const winning = Math.max(
      0,
      ...trick.filter((entry) => entry.card.suit === leadSuit).map((entry) => heartsRank(entry.card)),
    );
    const underWinning = legal.filter((card) => heartsRank(card) < winning).sort((a, b) => heartsRank(b) - heartsRank(a));
    if (underWinning.length && trickWinner(trick) !== player) return underWinning[0];
    return sortedLow[0];
  }

  const dump = [...legal].sort((a, b) => cardPoints(b) - cardPoints(a) || heartsRank(b) - heartsRank(a));
  return dump[0];
}

/** Computer pass choice: the three cards that are most dangerous to keep. */
export function chooseComputerPass(hand: Card[]): Card[] {
  const danger = (card: Card) => (card.suit === 'S' && card.rank === 12 ? 100 : 0)
    + (card.suit === 'S' && (card.rank === 1 || card.rank === 13) ? 20 : 0)
    + (card.suit === 'H' ? heartsRank(card) : 0)
    + heartsRank(card) / 2;
  return [...hand].sort((a, b) => danger(b) - danger(a)).slice(0, 3);
}
